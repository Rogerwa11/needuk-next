import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAuth, notificationSelect, AuthenticatedRequest } from '@/lib/utils';
import { successResponse, serverErrorResponse, notFoundResponse, badRequestResponse } from '@/lib/utils';

// Schema para marcar notificação como lida
const markAsReadSchema = z.object({
    notificationId: z.string(),
});

const INVITATION_TOKEN_REGEX = /\[invitation-id:([^\]]+)\]/;
const VACANCY_LINK_REGEX = /\[vacancy-link:([^\]]+)\]/;

const formatNotification = <T extends { message: string }>(notification: T) => {
    const invitationMatch = notification.message.match(INVITATION_TOKEN_REGEX);
    const vacancyMatch = notification.message.match(VACANCY_LINK_REGEX);

    const cleanedMessage = notification.message
        .replace(INVITATION_TOKEN_REGEX, '')
        .replace(VACANCY_LINK_REGEX, '')
        .replace(/\s+/g, ' ')
        .trim();

    return {
        ...notification,
        rawMessage: notification.message,
        message: cleanedMessage.length > 0 ? cleanedMessage : notification.message.trim(),
        invitationId: invitationMatch?.[1] ?? null,
        actionUrl: vacancyMatch?.[1] ?? null,
    };
};

// GET - Buscar notificações do usuário
export const GET = withAuth(async (request: AuthenticatedRequest) => {
    try {
        // Buscar notificações do usuário (mais recentes primeiro, não lidas primeiro)
        const notifications = await prisma.notification.findMany({
            where: {
                userId: request.user.id,
            },
            select: notificationSelect,
            orderBy: [
                { read: 'asc' }, // Não lidas primeiro
                { createdAt: 'desc' },
            ],
            take: 50, // Limitar a 50 notificações mais recentes
        });

        // Contar notificações não lidas
        const unreadCount = await prisma.notification.count({
            where: {
                userId: request.user.id,
                read: false,
            },
        });

        return successResponse('Notificações obtidas com sucesso', {
            notifications: notifications.map(formatNotification),
            unreadCount,
        });

    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        return serverErrorResponse();
    }
});

// PUT - Marcar notificação como lida
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
    try {
        // Obter os dados do corpo da requisição
        const body = await request.json();

        // Validar os dados
        const validatedData = markAsReadSchema.parse(body);

        // Verificar se a notificação pertence ao usuário e marcar como lida
        const updatedNotification = await prisma.notification.updateMany({
            where: {
                id: validatedData.notificationId,
                userId: request.user.id,
                read: false, // Só marcar se ainda não foi lida
            },
            data: {
                read: true,
                readAt: new Date(),
            },
        });

        if (updatedNotification.count === 0) {
            return notFoundResponse('Notificação não encontrada ou já foi lida');
        }

        // Buscar a notificação atualizada para retornar
        const notification = await prisma.notification.findUnique({
            where: { id: validatedData.notificationId },
            select: notificationSelect,
        });

        if (!notification) {
            return notFoundResponse('Notificação não encontrada após atualização');
        }

        return successResponse('Notificação marcada como lida', { notification: formatNotification(notification) });

    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);

        if (error instanceof z.ZodError) {
            return badRequestResponse('Dados inválidos', error.issues);
        }

        return serverErrorResponse();
    }
});
