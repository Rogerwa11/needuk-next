import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/utils';
import { successResponse, serverErrorResponse, notFoundResponse, badRequestResponse, forbiddenResponse } from '@/lib/utils';

// Schema para transferência de liderança
const transferLeadershipSchema = z.object({
    newLeaderId: z.string().min(1, 'Novo líder é obrigatório'),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT - Transferir liderança da atividade
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const resolvedParams = await params;
        const activityId = resolvedParams.id;
        const body = await request.json();
        const { newLeaderId } = transferLeadershipSchema.parse(body);

        // Verificar se a atividade existe
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                title: true,
                leaderId: true,
                participants: {
                    where: {
                        userId: newLeaderId,
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

        // Verificar se o usuário atual é o líder
        if (activity.leaderId !== request.user.id) {
            return forbiddenResponse('Apenas o líder atual pode transferir a liderança');
        }

        // Verificar se o novo líder é participante da atividade
        if (activity.participants.length === 0) {
            return badRequestResponse('O novo líder deve ser um participante da atividade');
        }

        // Verificar se o novo líder não é o líder atual
        if (newLeaderId === request.user.id) {
            return badRequestResponse('Você já é o líder da atividade');
        }

        // Buscar informações dos usuários envolvidos
        const [currentLeader, newLeader] = await Promise.all([
            prisma.user.findUnique({
                where: { id: request.user.id },
                select: { id: true, name: true, email: true }
            }),
            prisma.user.findUnique({
                where: { id: newLeaderId },
                select: { id: true, name: true, email: true }
            })
        ]);

        if (!currentLeader || !newLeader) {
            return notFoundResponse('Usuário não encontrado');
        }

        // Usar transação para garantir consistência
        await prisma.$transaction(async (tx) => {
            // Transferir liderança da atividade
            await tx.activity.update({
                where: { id: activityId },
                data: {
                    leaderId: newLeaderId,
                }
            });

            // Limpar o campo role do antigo líder
            await tx.activityParticipant.updateMany({
                where: {
                    activityId: activityId,
                    userId: request.user.id, // Antigo líder
                },
                data: {
                    role: null, // Limpar o campo role
                }
            });

            // Definir o role do novo líder (opcional)
            await tx.activityParticipant.updateMany({
                where: {
                    activityId: activityId,
                    userId: newLeaderId,
                },
                data: {
                    role: 'Líder', // Opcional: definir role do novo líder
                }
            });

            // Criar notificações
            // Notificação para o novo líder
            await tx.notification.create({
                data: {
                    userId: newLeaderId,
                    type: 'activity_update',
                    title: 'Você é o novo líder!',
                    message: `Você recebeu a liderança da atividade "${activity.title}" de ${currentLeader.name || currentLeader.email}`,
                },
            });

            // Notificação para o antigo líder
            await tx.notification.create({
                data: {
                    userId: request.user.id,
                    type: 'activity_update',
                    title: 'Liderança transferida',
                    message: `Você transferiu a liderança da atividade "${activity.title}" para ${newLeader.name || newLeader.email}`,
                },
            });

            // Notificação para todos os outros participantes
            const otherParticipants = await tx.activityParticipant.findMany({
                where: {
                    activityId: activityId,
                    userId: {
                        notIn: [request.user.id, newLeaderId]
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
                    title: 'Liderança transferida',
                    message: `${newLeader.name || newLeader.email} agora é o líder da atividade "${activity.title}"`,
                }));

                await tx.notification.createMany({
                    data: notifications,
                });
            }
        });

        return successResponse('Liderança transferida com sucesso', {
            newLeader: {
                id: newLeader.id,
                name: newLeader.name,
                email: newLeader.email,
            }
        });

    } catch (error) {
        console.error('Erro ao transferir liderança:', error);

        if (error instanceof z.ZodError) {
            return badRequestResponse('Dados inválidos', error.issues);
        }

        return serverErrorResponse();
    }
});
