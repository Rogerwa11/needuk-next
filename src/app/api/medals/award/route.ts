import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/utils';
import { successResponse, serverErrorResponse, notFoundResponse, badRequestResponse, forbiddenResponse } from '@/lib/utils';

// Schema para premiação de medalha
const awardMedalSchema = z.object({
    medalType: z.enum(['GOLD', 'SILVER', 'BRONZE']),
    userId: z.string(),
    activityId: z.string(),
    reason: z.string().optional(),
});

// POST - Conceder medalha
export const POST = withAuth(async (request: AuthenticatedRequest) => {
    try {
        // Verificar se é gestor
        const currentUser = await prisma.user.findUnique({
            where: { id: request.user.id },
            select: { userType: true }
        });

        if (currentUser?.userType !== 'gestor') {
            return forbiddenResponse('Apenas gestores podem premiar medalhas');
        }

        // Obter os dados do corpo da requisição
        const body = await request.json();
        const { medalType, userId, activityId, reason } = awardMedalSchema.parse(body);

        // Verificar se o usuário a receber existe e é aluno
        const recipient = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                userType: true,
                goldMedals: true,
                silverMedals: true,
                bronzeMedals: true,
            }
        });

        if (!recipient) {
            return notFoundResponse('Usuário não encontrado');
        }

        if (recipient.userType !== 'aluno') {
            return badRequestResponse('Apenas alunos podem receber medalhas');
        }

        // Verificar se o gestor está participando da atividade
        const gestorInActivity = await prisma.activityParticipant.findFirst({
            where: {
                activityId: activityId,
                userId: request.user.id,
            },
        });

        if (!gestorInActivity) {
            return forbiddenResponse('Você deve estar participando da atividade para premiar medalhas');
        }

        // Verificar se o aluno está participando da atividade
        const studentInActivity = await prisma.activityParticipant.findFirst({
            where: {
                activityId: activityId,
                userId: userId,
            },
        });

        if (!studentInActivity) {
            return badRequestResponse('O aluno deve estar participando da atividade para receber medalhas');
        }

        // Definir dados da medalha
        const medalData = {
            GOLD: {
                name: 'Medalha de Ouro',
                description: 'Excelente desempenho e dedicação',
                icon: '🥇',
                color: '#FFD700'
            },
            SILVER: {
                name: 'Medalha de Prata',
                description: 'Ótimo desempenho e contribuição',
                icon: '🥈',
                color: '#C0C0C0'
            },
            BRONZE: {
                name: 'Medalha de Bronze',
                description: 'Bom desempenho e participação',
                icon: '🥉',
                color: '#CD7F32'
            }
        };

        const medal = medalData[medalType];

        // Usar transação para garantir consistência
        const result = await prisma.$transaction(async (tx) => {
            // Incrementar contador específico de medalhas do usuário
            const medalField = medalType === 'GOLD' ? 'goldMedals' :
                medalType === 'SILVER' ? 'silverMedals' : 'bronzeMedals';

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    [medalField]: {
                        increment: 1,
                    }
                },
                select: {
                    id: true,
                    name: true,
                    goldMedals: true,
                    silverMedals: true,
                    bronzeMedals: true,
                }
            });

            // Criar notificação para o usuário premiado
            await tx.notification.create({
                data: {
                    userId: userId,
                    type: 'medal',
                    title: 'Nova medalha conquistada! 🏆',
                    message: `Você recebeu a medalha "${medal.name}"${reason ? ` por: ${reason}` : ''}`,
                },
            });

            return {
                user: updatedUser,
                medal: medal,
                reason: reason,
                awardedBy: request.user.id,
                awardedAt: new Date(),
            };
        });

        return successResponse('Medalha premiada com sucesso', {
            award: result,
        });

    } catch (error) {
        console.error('Erro ao premiar medalha:', error);

        if (error instanceof z.ZodError) {
            return badRequestResponse('Dados inválidos', error.issues);
        }

        return serverErrorResponse();
    }
});
