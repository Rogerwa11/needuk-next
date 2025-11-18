import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
    badRequestResponse,
    forbiddenResponse,
    notFoundResponse,
    serverErrorResponse,
    successResponse,
    validationErrorResponse,
} from '@/lib/utils';
import { AuthenticatedRequest, withAuth } from '@/lib/utils';

const decisionSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
    note: z.string().trim().max(2000).optional(),
});

export const PATCH = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string; applicationId: string }> }) => {
    const { id: vacancyId, applicationId } = await context.params;

    if (!vacancyId || !applicationId) {
        return badRequestResponse('Identificação inválida');
    }

    try {
        const body = await request.json();
        const { status, note } = decisionSchema.parse(body);

        const vacancy = await prisma.vacancy.findUnique({
            where: { id: vacancyId },
            select: {
                id: true,
                title: true,
                recruiterId: true,
            },
        });

        if (!vacancy) {
            return notFoundResponse('Vaga não encontrada');
        }

        if (vacancy.recruiterId !== request.user.id) {
            return forbiddenResponse('Somente o criador da vaga pode gerenciar candidaturas');
        }

        const application = await prisma.vacancyApplication.findUnique({
            where: { id: applicationId },
            select: {
                id: true,
                vacancyId: true,
                applicantId: true,
                status: true,
                applicant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!application || application.vacancyId !== vacancyId) {
            return notFoundResponse('Candidatura não encontrada para esta vaga');
        }

        const updated = await prisma.vacancyApplication.update({
            where: { id: application.id },
            data: {
                status,
                decisionNote: note ?? null,
                decidedAt: new Date(),
                decidedById: request.user.id,
            },
            select: {
                id: true,
                status: true,
                decisionNote: true,
                decidedAt: true,
                applicantId: true,
            },
        });

        const decisionMessage =
            status === 'ACCEPTED'
                ? `Parabéns! Sua candidatura para a vaga "${vacancy.title}" foi aprovada.`
                : `A candidatura para a vaga "${vacancy.title}" foi encerrada. Agradecemos o seu interesse.`;

        await prisma.notification.create({
            data: {
                userId: application.applicantId,
                type: 'system',
                title: status === 'ACCEPTED' ? 'Candidatura aprovada' : 'Atualização da candidatura',
                message: note ? `${decisionMessage} Observação: ${note}` : decisionMessage,
            },
        });

        return successResponse('Candidatura atualizada com sucesso', {
            application: {
                id: updated.id,
                status: updated.status,
                decisionNote: updated.decisionNote,
                decidedAt: updated.decidedAt,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error);
        }

        console.error('Erro ao atualizar candidatura:', error);
        return serverErrorResponse();
    }
});

