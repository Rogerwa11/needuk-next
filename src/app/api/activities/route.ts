import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
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

        // Buscar atividades onde o usuário:
        // 1. É o criador E ainda é participante/líder
        // 2. É um participante direto (não criador)
        const [createdActivities, participatingActivities] = await Promise.all([
            // Atividades criadas pelo usuário (mas só se ainda for participante ou líder)
            prisma.activity.findMany({
                where: {
                    AND: [
                        { createdBy: session.user.id },
                        {
                            OR: [
                                { leaderId: session.user.id }, // É o líder
                                {
                                    participants: {
                                        some: {
                                            userId: session.user.id
                                        }
                                    }
                                } // É participante
                            ]
                        }
                    ]
                },
                include: {
                    _count: {
                        select: {
                            participants: true,
                        }
                    },
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),

            // Atividades onde o usuário é participante
            prisma.activity.findMany({
                where: {
                    participants: {
                        some: {
                            userId: session.user.id,
                        }
                    },
                    // Excluir atividades que ele mesmo criou (para evitar duplicatas)
                    createdBy: {
                        not: session.user.id,
                    }
                },
                include: {
                    _count: {
                        select: {
                            participants: true,
                        }
                    },
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);

        // Combinar as atividades e remover duplicatas
        const allActivities = [...createdActivities, ...participatingActivities];

        // Remover duplicatas baseado no ID
        const uniqueActivities = allActivities.filter((activity, index, self) =>
            index === self.findIndex(a => a.id === activity.id)
        );

        return NextResponse.json({
            activities: uniqueActivities,
            total: uniqueActivities.length,
        });

    } catch (error) {
        console.error('Erro ao buscar atividades:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
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

        // Verificar se o usuário tem permissão para criar atividades
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { userType: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        // Apenas alunos, recrutadores e gestores podem criar atividades
        if (!['aluno', 'recrutador', 'gestor'].includes(user.userType)) {
            return NextResponse.json(
                { error: 'Você não tem permissão para criar atividades' },
                { status: 403 }
            );
        }

        // Obter os dados do corpo da requisição
        const body = await request.json();
        const {
            title,
            description,
            startDate,
            endDate,
            participantEmails = [],
            links = []
        } = body;

        // Validações básicas
        if (!title || !startDate) {
            return NextResponse.json(
                { error: 'Título e data de início são obrigatórios' },
                { status: 400 }
            );
        }

        // Validar data de início
        const startDateTime = new Date(startDate);
        if (isNaN(startDateTime.getTime())) {
            return NextResponse.json(
                { error: 'Data de início inválida' },
                { status: 400 }
            );
        }

        // Validar data de fim se fornecida
        let endDateTime = null;
        if (endDate) {
            endDateTime = new Date(endDate);
            if (isNaN(endDateTime.getTime())) {
                return NextResponse.json(
                    { error: 'Data de fim inválida' },
                    { status: 400 }
                );
            }

            if (endDateTime <= startDateTime) {
                return NextResponse.json(
                    { error: 'Data de fim deve ser posterior à data de início' },
                    { status: 400 }
                );
            }
        }

        // Usar uma transação para garantir consistência
        const result = await prisma.$transaction(async (tx) => {
            // Criar a atividade
            const activity = await tx.activity.create({
                data: {
                    title,
                    description: description || null,
                    startDate: startDateTime,
                    endDate: endDateTime,
                    createdBy: session.user.id,
                    leaderId: session.user.id, // O criador é o líder inicial
                },
            });

            // Adicionar o criador como participante
            await tx.activityParticipant.create({
                data: {
                    activityId: activity.id,
                    userId: session.user.id,
                    role: 'Líder',
                },
            });

            // Processar convites para outros participantes
            if (participantEmails && participantEmails.length > 0) {
                for (const email of participantEmails) {
                    // Verificar se o usuário existe
                    const user = await tx.user.findUnique({
                        where: { email },
                    });

                    if (user) {
                        // Se o usuário existe, criar convite (não adicionar diretamente)
                        const invitation = await tx.activityInvitation.create({
                            data: {
                                activityId: activity.id,
                                invitedEmail: email,
                                invitedBy: session.user.id,
                                status: 'pending',
                            },
                        });

                        // Criar notificação para o usuário
                        await tx.notification.create({
                            data: {
                                userId: user.id,
                                type: 'invitation',
                                title: 'Novo convite para atividade',
                                message: `Você foi convidado para participar da atividade "${title}". [invitation-id:${invitation.id}]`,
                            },
                        });
                    } else {
                        // Se o usuário não existe, criar convite pendente
                        await tx.activityInvitation.create({
                            data: {
                                activityId: activity.id,
                                invitedEmail: email,
                                invitedBy: session.user.id,
                                status: 'pending',
                            },
                        });
                    }
                }
            }

            // Adicionar links se fornecidos
            if (links && links.length > 0) {
                for (const link of links) {
                    if (link.title && link.url) {
                        await tx.activityLink.create({
                            data: {
                                activityId: activity.id,
                                title: link.title,
                                url: link.url,
                            },
                        });
                    }
                }
            }

            return activity;
        });

        return NextResponse.json({
            success: true,
            message: 'Atividade criada com sucesso',
            activity: result,
        });

    } catch (error) {
        console.error('Erro ao criar atividade:', error);

        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { error: 'Já existe uma atividade com este título' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
