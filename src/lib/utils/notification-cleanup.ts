import { prisma } from '@/lib/prisma';

/**
 * Limpa notificações lidas há mais de 1 hora
 * @returns Promise<{deletedCount: number}>
 */
export async function cleanupOldNotifications(): Promise<{ deletedCount: number }> {
    try {
        // Calcular a data limite (1 hora atrás)
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        // Deletar notificações lidas há mais de 1 hora
        const deletedNotifications = await prisma.notification.deleteMany({
            where: {
                read: true,
                readAt: {
                    lt: oneHourAgo, // Menor que 1 hora atrás
                },
            },
        });

        console.log(`🧹 Limpeza de notificações: ${deletedNotifications.count} notificações removidas`);

        return { deletedCount: deletedNotifications.count };

    } catch (error) {
        console.error('❌ Erro ao limpar notificações:', error);
        throw error;
    }
}

/**
 * Conta quantas notificações serão removidas na próxima limpeza
 * @returns Promise<{count: number}>
 */
export async function countOldNotifications(): Promise<{ count: number }> {
    try {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const count = await prisma.notification.count({
            where: {
                read: true,
                readAt: {
                    lt: oneHourAgo,
                },
            },
        });

        return { count };

    } catch (error) {
        console.error('❌ Erro ao contar notificações antigas:', error);
        throw error;
    }
}
