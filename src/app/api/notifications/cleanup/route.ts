import { NextRequest } from 'next/server';
import { cleanupOldNotifications, countOldNotifications } from '@/lib/utils';
import { successResponse, serverErrorResponse, badRequestResponse } from '@/lib/utils';

// GET - Contar quantas notificações serão removidas
export const GET = async (request: NextRequest) => {
    try {
        const { count } = await countOldNotifications();

        return successResponse(
            `${count} notificações serão removidas na próxima limpeza.`,
            { count }
        );

    } catch (error) {
        console.error('Erro ao contar notificações antigas:', error);
        return serverErrorResponse();
    }
};

// DELETE - Limpar notificações lidas há mais de 1 hora
export const DELETE = async (request: NextRequest) => {
    try {
        // Verificar se é uma requisição autorizada (pode ser chamada por cron job)
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.CLEANUP_TOKEN || 'needuk-cleanup-token';

        if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
            return badRequestResponse('Token de autorização inválido');
        }

        const { deletedCount } = await cleanupOldNotifications();

        return successResponse(
            `Limpeza concluída. ${deletedCount} notificações removidas.`,
            { deletedCount }
        );

    } catch (error) {
        console.error('Erro ao limpar notificações:', error);
        return serverErrorResponse();
    }
};
