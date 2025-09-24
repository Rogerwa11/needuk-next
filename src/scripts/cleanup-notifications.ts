#!/usr/bin/env tsx

/**
 * Script para limpeza automática de notificações lidas
 * Deve ser executado periodicamente via cron job
 *
 * Exemplo de cron job (executar a cada hora):
 * 0 * * * * cd /path/to/project && npm run cleanup:notifications
 */

import { cleanupOldNotifications } from '@/lib/utils';

async function main() {
    try {
        console.log('🚀 Iniciando limpeza de notificações...');

        const startTime = Date.now();
        const { deletedCount } = await cleanupOldNotifications();
        const duration = Date.now() - startTime;

        console.log(`✅ Limpeza concluída em ${duration}ms`);
        console.log(`📊 ${deletedCount} notificações removidas`);

        // Sair com código 0 (sucesso)
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
        // Sair com código 1 (erro)
        process.exit(1);
    }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
    main();
}

export { main as cleanupNotifications };
