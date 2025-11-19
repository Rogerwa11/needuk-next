import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string; participantId: string }>;
}

// DELETE - Remover participante da atividade
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const resolvedParams = await params;

        const activityId = resolvedParams.id;
        const participantId = resolvedParams.participantId;

        // Verificar se a atividade existe e se o usuário é o líder
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                leaderId: true,
                title: true,
                participants: {
                    where: {
                        id: participantId
                    },
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        });

        if (!activity) {
            return NextResponse.json(
                { error: 'Atividade não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se o usuário é o líder
        if (activity.leaderId !== request.user.id) {
            return NextResponse.json(
                { error: 'Apenas o líder pode remover participantes' },
                { status: 403 }
            );
        }

        // Verificar se o participante existe
        if (activity.participants.length === 0) {
            return NextResponse.json(
                { error: 'Participante não encontrado nesta atividade' },
                { status: 404 }
            );
        }

        const participant = activity.participants[0];

        // Não permitir que o líder se remova
        if (participant.userId === activity.leaderId) {
            return NextResponse.json(
                { error: 'O líder não pode ser removido da atividade' },
                { status: 400 }
            );
        }

        // Usar transação para garantir consistência
        await prisma.$transaction(async (tx) => {
            // Remover o participante
            await tx.activityParticipant.delete({
                where: {
                    id: participantId
                }
            });

            // Remover observações do participante
            await tx.activityObservation.deleteMany({
                where: {
                    activityId: activityId,
                    userId: participant.userId
                }
            });

            // Criar notificação para o participante removido
            await tx.notification.create({
                data: {
                    userId: participant.userId,
                    type: 'activity_update',
                    title: 'Removido da atividade',
                    message: `Você foi removido da atividade "${activity.title}"`,
                }
            });

            // Notificar outros participantes sobre a remoção
            const otherParticipants = await tx.activityParticipant.findMany({
                where: {
                    activityId: activityId,
                    userId: {
                        not: participant.userId
                    }
                },
                select: {
                    userId: true,
                }
            });

            if (otherParticipants.length > 0) {
                const notifications = otherParticipants.map(p => ({
                    userId: p.userId,
                    type: 'activity_update' as const,
                    title: 'Participante removido',
                    message: `${participant.user.name || participant.user.email} foi removido da atividade "${activity.title}"`,
                }));

                await tx.notification.createMany({
                    data: notifications,
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: `${participant.user.name || participant.user.email} foi removido da atividade`,
        });

    } catch (error) {
        console.error('Erro ao remover participante:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
});
