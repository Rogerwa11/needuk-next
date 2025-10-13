import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para convidar participantes
const inviteParticipantsSchema = z.object({
    emails: z.array(z.string().email('Email inválido')),
    activityTitle: z.string().min(1, 'Título da atividade é obrigatório'),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST - Convidar participantes para a atividade
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
        const { emails, activityTitle } = inviteParticipantsSchema.parse(body);

        // Padronizar emails para lowercase
        const normalizedEmails = emails.map(email => email.toLowerCase().trim());

        // Verificar se a atividade existe e se o usuário é o líder
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
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
            return NextResponse.json(
                { error: 'Atividade não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se o usuário é o líder
        if (activity.leaderId !== session.user.id) {
            return NextResponse.json(
                { error: 'Apenas o líder pode convidar participantes' },
                { status: 403 }
            );
        }

        // Buscar usuários existentes pelos emails
        const existingUsers = await prisma.user.findMany({
            where: {
                email: {
                    in: normalizedEmails
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
            }
        });

        const existingEmails = existingUsers.map(user => user.email);
        const newEmails = normalizedEmails.filter(email => !existingEmails.includes(email));

        // Verificar se todos os emails foram encontrados
        if (newEmails.length > 0) {
            return NextResponse.json(
                {
                    error: 'Usuário não encontrado',
                    message: `Os seguintes emails não foram encontrados na plataforma: ${newEmails.join(', ')}`,
                    notFoundEmails: newEmails
                },
                { status: 422 }
            );
        }

        // Verificar se algum usuário já é participante da atividade
        const alreadyParticipants = existingUsers.filter(user =>
            activity.participants.some(p => p.userId === user.id)
        );

        if (alreadyParticipants.length > 0) {
            return NextResponse.json(
                {
                    error: 'Usuário já participa da atividade',
                    message: `Os seguintes usuários já participam da atividade: ${alreadyParticipants.map(u => u.email).join(', ')}`,
                    alreadyParticipants: alreadyParticipants.map(u => u.email)
                },
                { status: 422 }
            );
        }

        // Usar transação para garantir consistência
        await prisma.$transaction(async (tx) => {
            // Para usuários existentes, verificar se já foram convidados
            for (const user of existingUsers) {
                const isAlreadyInvited = await tx.activityInvitation.findFirst({
                    where: {
                        activityId: activityId,
                        invitedEmail: user.email,
                        status: 'pending'
                    }
                });

                if (!isAlreadyInvited) {
                    // Criar convite para usuário existente
                    const invitation = await tx.activityInvitation.create({
                        data: {
                            activityId: activityId,
                            invitedEmail: user.email,
                            invitedBy: session.user.id,
                            status: 'pending',
                        }
                    });

                    // Criar notificação
                    await tx.notification.create({
                        data: {
                            userId: user.id,
                            type: 'invitation',
                            title: 'Novo convite para atividade',
                            message: `Você foi convidado para participar da atividade "${activityTitle}". [invitation-id:${invitation.id}]`,
                        }
                    });
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Convites enviados com sucesso!`,
            invitedUsers: existingUsers.length,
        });

    } catch (error) {
        console.error('Erro ao convidar participantes:', error);

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
