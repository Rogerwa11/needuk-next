import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para criação de observação
const createObservationSchema = z.object({
    content: z.string().min(1, 'Conteúdo é obrigatório').max(1000, 'Conteúdo deve ter no máximo 1000 caracteres'),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Listar observações da atividade
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
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

        const activityId = resolvedParams.id;

        // Verificar se a atividade existe e se o usuário é participante
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                title: true,
                participants: {
                    where: {
                        userId: session.user.id,
                    },
                    select: {
                        userId: true,
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

        if (activity.participants.length === 0) {
            return NextResponse.json(
                { error: 'Você não é participante desta atividade' },
                { status: 403 }
            );
        }

        // Buscar observações
        const observations = await prisma.activityObservation.findMany({
            where: { activityId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            observations,
            total: observations.length
        });

    } catch (error) {
        console.error('Erro ao buscar observações:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST - Criar nova observação
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
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

        const activityId = resolvedParams.id;
        const body = await request.json();
        const { content } = createObservationSchema.parse(body);

        // Verificar se a atividade existe e se o usuário é participante
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                title: true,
                participants: {
                    where: {
                        userId: session.user.id,
                    },
                    select: {
                        userId: true,
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

        if (activity.participants.length === 0) {
            return NextResponse.json(
                { error: 'Você não é participante desta atividade' },
                { status: 403 }
            );
        }

        // Criar observação
        const observation = await prisma.activityObservation.create({
            data: {
                activityId,
                userId: session.user.id,
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                activity: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });

        // Criar notificações para outros participantes
        const otherParticipants = await prisma.activityParticipant.findMany({
            where: {
                activityId,
                userId: {
                    not: session.user.id,
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
                title: 'Nova observação na atividade',
                message: `${session.user.name} adicionou uma observação em "${activity.title}"`,
            }));

            await prisma.notification.createMany({
                data: notifications,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Observação adicionada com sucesso',
            observation,
        });

    } catch (error) {
        console.error('Erro ao criar observação:', error);

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
