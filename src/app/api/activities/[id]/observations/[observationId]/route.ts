import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/utils/auth-middleware';
import { forbiddenResponse, notFoundResponse, serverErrorResponse } from '@/lib/utils/response-helpers';

interface RouteParams {
    params: Promise<{ id: string; observationId: string }>;
}

// DELETE - Deletar observação específica
export const DELETE = withAuth(async (request: any, { params }: RouteParams) => {
    try {
        const resolvedParams = await params;
        const activityId = resolvedParams.id;
        const observationId = resolvedParams.observationId;

        // Verificar se a atividade existe e obter informações sobre liderança
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                title: true,
                leaderId: true,
                participants: {
                    where: {
                        userId: request.user.id,
                    },
                    select: {
                        userId: true,
                    }
                }
            }
        });

        if (!activity) {
            return notFoundResponse('Atividade não encontrada');
        }

        // Verificar se o usuário é participante da atividade
        if (activity.participants.length === 0) {
            return forbiddenResponse('Você não é participante desta atividade');
        }

        // Buscar a observação
        const observation = await prisma.activityObservation.findUnique({
            where: { id: observationId },
            select: {
                id: true,
                userId: true,
                activityId: true,
                content: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        if (!observation) {
            return notFoundResponse('Observação não encontrada');
        }

        // Verificar se a observação pertence à atividade correta
        if (observation.activityId !== activityId) {
            return forbiddenResponse('Esta observação não pertence a esta atividade');
        }

        // Verificar permissões:
        // 1. O usuário é o autor da observação OU
        // 2. O usuário é o líder da atividade
        const isAuthor = observation.userId === request.user.id;
        const isLeader = activity.leaderId === request.user.id;

        if (!isAuthor && !isLeader) {
            return forbiddenResponse('Você não tem permissão para deletar esta observação');
        }

        // Deletar a observação
        await prisma.activityObservation.delete({
            where: { id: observationId }
        });

        // Se não for o líder deletando, criar notificação para o líder
        if (!isLeader && activity.leaderId !== request.user.id) {
            await prisma.notification.create({
                data: {
                    userId: activity.leaderId,
                    type: 'activity_update',
                    title: 'Observação removida',
                    message: `${request.user.name} removeu uma observação de ${observation.user.name} na atividade "${activity.title}"`,
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Observação deletada com sucesso',
        });

    } catch (error) {
        console.error('Erro ao deletar observação:', error);
        return serverErrorResponse();
    }
});
