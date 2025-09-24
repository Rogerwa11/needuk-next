import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para validação da resposta ao convite
const respondInvitationSchema = z.object({
    action: z.enum(['accept', 'decline']),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Aguardar os parâmetros da rota
        const resolvedParams = await params;

        // Verificar se o usuário está autenticado
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Obter os dados do corpo da requisição
        const body = await request.json();
        const { action } = respondInvitationSchema.parse(body);

        const invitationId = resolvedParams.id;

        // Buscar o convite
        const invitation = await prisma.activityInvitation.findUnique({
            where: { id: invitationId },
            include: {
                activity: true,
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        if (!invitation) {
            return NextResponse.json(
                { error: 'Convite não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se o convite é para o usuário logado
        if (invitation.invitedEmail !== session.user.email) {
            return NextResponse.json(
                { error: 'Este convite não é para você' },
                { status: 403 }
            );
        }

        // Verificar se o convite ainda está pendente
        if (invitation.status !== 'pending') {
            return NextResponse.json(
                { error: 'Este convite já foi respondido' },
                { status: 400 }
            );
        }

        // Usar transação para garantir consistência
        const result = await prisma.$transaction(async (tx) => {
            // Remover a notificação original do convite
            await tx.notification.deleteMany({
                where: {
                    userId: session.user.id,
                    type: 'invitation',
                    message: {
                        contains: `[invitation-id:${invitationId}]`
                    }
                }
            });

            if (action === 'accept') {
                // Aceitar o convite
                await tx.activityInvitation.update({
                    where: { id: invitationId },
                    data: {
                        status: 'accepted',
                        acceptedBy: session.user.id,
                    },
                });

                // Verificar se o usuário já é participante da atividade
                const existingParticipant = await tx.activityParticipant.findUnique({
                    where: {
                        activityId_userId: {
                            activityId: invitation.activityId,
                            userId: session.user.id,
                        }
                    }
                });

                if (!existingParticipant) {
                    // Adicionar o usuário como participante
                    await tx.activityParticipant.create({
                        data: {
                            activityId: invitation.activityId,
                            userId: session.user.id,
                            role: null, // Sem cargo específico
                        },
                    });
                }

                // Criar notificação para o organizador
                await tx.notification.create({
                    data: {
                        userId: invitation.invitedBy,
                        type: 'system',
                        title: 'Convite aceito',
                        message: `${session.user.name || session.user.email} aceitou o convite para "${invitation.activity.title}"`,
                    },
                });

                return {
                    success: true,
                    message: 'Convite aceito com sucesso',
                    action: 'accepted'
                };

            } else {
                // Recusar o convite
                await tx.activityInvitation.update({
                    where: { id: invitationId },
                    data: {
                        status: 'declined',
                    },
                });

                // Criar notificação para o organizador
                await tx.notification.create({
                    data: {
                        userId: invitation.invitedBy,
                        type: 'system',
                        title: 'Convite recusado',
                        message: `${session.user.name || session.user.email} recusou o convite para "${invitation.activity.title}"`,
                    },
                });

                return {
                    success: true,
                    message: 'Convite recusado',
                    action: 'declined'
                };
            }
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Erro ao responder convite:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dados inválidos',
                    details: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
