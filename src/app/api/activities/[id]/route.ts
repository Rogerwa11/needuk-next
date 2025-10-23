import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAuth, validationErrorResponse, activityDetailSelect, AuthenticatedRequest } from '@/lib/utils';
import {
    successResponse,
    serverErrorResponse,
    notFoundResponse,
    forbiddenResponse,
    badRequestResponse
} from '@/lib/utils';

// Schema para atualização de atividade
const linkSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
    url: z.string().url('URL inválida'),
});

const updateActivitySchema = z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres').optional(),
    description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
    status: z.enum(['pending', 'completed']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().nullable().optional(),
    links: z.array(linkSchema).max(50, 'Máximo de 50 links').optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Buscar atividade específica
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const resolvedParams = await params;
        const activityId = resolvedParams.id;

        // Buscar atividade usando select padronizado
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: activityDetailSelect,
        });

        if (!activity) {
            return notFoundResponse('Atividade não encontrada');
        }

        // Verificar se o usuário tem permissão para ver esta atividade
        const isCreator = activity.createdBy === request.user.id;
        const isParticipant = activity.participants.some(p => p.userId === request.user.id);

        if (!isCreator && !isParticipant) {
            return forbiddenResponse('Você não tem permissão para ver esta atividade');
        }

        return successResponse('Atividade obtida com sucesso', { activity });

    } catch (error) {
        console.error('Erro ao buscar atividade:', error);
        return serverErrorResponse();
    }
});

// PUT - Atualizar atividade
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const resolvedParams = await params;
        const activityId = resolvedParams.id;
        const body = await request.json();
        const validatedData = updateActivitySchema.parse(body);

        // Verificar se a atividade existe e se o usuário é o líder
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                leaderId: true,
                createdBy: true,
                title: true,
            }
        });

        if (!activity) {
            return notFoundResponse('Atividade não encontrada');
        }

        if (activity.leaderId !== request.user.id) {
            return forbiddenResponse('Apenas o líder da atividade pode editá-la');
        }

        // Preparar dados para atualização
        const updateData: any = {};

        if (validatedData.title !== undefined) updateData.title = validatedData.title;
        if (validatedData.description !== undefined) updateData.description = validatedData.description;
        if (validatedData.status !== undefined) updateData.status = validatedData.status;

        if (validatedData.startDate !== undefined) {
            const startDate = new Date(validatedData.startDate);
            if (isNaN(startDate.getTime())) {
                return badRequestResponse('Data de início inválida');
            }
            updateData.startDate = startDate;
        }

        if (validatedData.endDate !== undefined) {
            if (validatedData.endDate === null) {
                updateData.endDate = null;
            } else {
                const endDate = new Date(validatedData.endDate);
                if (isNaN(endDate.getTime())) {
                    return badRequestResponse('Data de fim inválida');
                }

                if (updateData.startDate && endDate <= updateData.startDate) {
                    return badRequestResponse('Data de fim deve ser posterior à data de início');
                }
                updateData.endDate = endDate;
            }
        }

        // Atualizar atividade e substituir links (se enviados)
        const updatedActivity = await prisma.$transaction(async (tx) => {
            const act = await tx.activity.update({
                where: { id: activityId },
                data: updateData,
                select: activityDetailSelect,
            });

            if (validatedData.links) {
                await tx.activityLink.deleteMany({ where: { activityId } });
                if (validatedData.links.length > 0) {
                    await tx.activityLink.createMany({
                        data: validatedData.links.map((l) => ({
                            activityId,
                            title: l.title,
                            url: l.url,
                        }))
                    });
                }
            }

            return act;
        });

        // Criar notificações para todos os participantes sobre a atualização
        if (Object.keys(updateData).length > 0) {
            const participants = await prisma.activityParticipant.findMany({
                where: { activityId },
                select: { userId: true }
            });

            const notifications = participants
                .filter(p => p.userId !== request.user.id) // Não notificar o próprio líder
                .map(p => ({
                    userId: p.userId,
                    type: 'activity_update' as const,
                    title: 'Atividade atualizada',
                    message: `A atividade "${updatedActivity.title}" foi atualizada`,
                }));

            if (notifications.length > 0) {
                await prisma.notification.createMany({
                    data: notifications,
                });
            }
        }

        return successResponse('Atividade atualizada com sucesso', { activity: updatedActivity });

    } catch (error) {
        console.error('Erro ao atualizar atividade:', error);

        if (error instanceof z.ZodError) {
            return validationErrorResponse(error);
        }

        return serverErrorResponse();
    }
});

// DELETE - Excluir atividade
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const resolvedParams = await params;
        const activityId = resolvedParams.id;

        // Verificar se a atividade existe e se o usuário é o líder
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                leaderId: true,
                title: true,
                participants: {
                    select: {
                        userId: true,
                    }
                }
            }
        });

        if (!activity) {
            return notFoundResponse('Atividade não encontrada');
        }

        if (activity.leaderId !== request.user.id) {
            return forbiddenResponse('Apenas o líder da atividade pode excluí-la');
        }

        // Criar notificações para participantes sobre a exclusão
        if (activity.participants.length > 1) { // Se há outros participantes além do líder
            const notifications = activity.participants
                .filter(p => p.userId !== request.user.id)
                .map(p => ({
                    userId: p.userId,
                    type: 'system' as const,
                    title: 'Atividade excluída',
                    message: `A atividade "${activity.title}" foi excluída pelo líder`,
                }));

            await prisma.notification.createMany({
                data: notifications,
            });
        }

        // Excluir atividade (o Prisma cuidará das relações devido às constraints CASCADE)
        await prisma.activity.delete({
            where: { id: activityId },
        });

        return successResponse('Atividade excluída com sucesso');

    } catch (error) {
        console.error('Erro ao excluir atividade:', error);
        return serverErrorResponse();
    }
});
