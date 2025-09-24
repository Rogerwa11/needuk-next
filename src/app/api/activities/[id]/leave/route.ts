import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// DELETE - Abandonar atividade (participante sai da atividade)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

        // Verificar se a atividade existe
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                title: true,
                leaderId: true,
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

        // Verificar se o usuário é participante da atividade
        if (activity.participants.length === 0) {
            return NextResponse.json(
                { error: 'Você não é participante desta atividade' },
                { status: 403 }
            );
        }

        // Verificar se o usuário é o líder (líder não pode abandonar, deve transferir liderança)
        if (activity.leaderId === session.user.id) {
            return NextResponse.json(
                { error: 'Como líder da atividade, você não pode abandoná-la. Transfira a liderança primeiro.' },
                { status: 403 }
            );
        }

        // Remover o participante da atividade
        await prisma.activityParticipant.deleteMany({
            where: {
                activityId: activityId,
                userId: session.user.id,
            }
        });

        // Buscar informações do usuário que está saindo
        const leavingUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        // Criar notificação para o líder sobre a saída
        if (leavingUser) {
            await prisma.notification.create({
                data: {
                    userId: activity.leaderId,
                    type: 'activity_update',
                    title: 'Participante saiu da atividade',
                    message: `${leavingUser.name || leavingUser.email} abandonou a atividade "${activity.title}"`,
                },
            });
        }

        // Se restar apenas o líder, verificar se ainda há atividade válida
        const remainingParticipants = await prisma.activityParticipant.count({
            where: { activityId: activityId }
        });

        return NextResponse.json({
            success: true,
            message: 'Você abandonou a atividade com sucesso',
            remainingParticipants: remainingParticipants,
        });

    } catch (error) {
        console.error('Erro ao abandonar atividade:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
