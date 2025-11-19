import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string; linkId: string }>;
}

// DELETE - Remover link específico
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const resolvedParams = await params;

        const activityId = resolvedParams.id;
        const linkId = resolvedParams.linkId;

        // Verificar se o link existe e pertence à atividade
        const link = await prisma.activityLink.findFirst({
            where: {
                id: linkId,
                activityId: activityId,
            },
        });

        if (!link) {
            return NextResponse.json(
                { error: 'Link não encontrado nesta atividade' },
                { status: 404 }
            );
        }

        // Verificar se o usuário é participante da atividade
        const participant = await prisma.activityParticipant.findFirst({
            where: {
                activityId,
                userId: request.user.id,
            },
        });

        if (!participant) {
            return NextResponse.json(
                { error: 'Você não é participante desta atividade' },
                { status: 403 }
            );
        }

        // Remover link
        await prisma.activityLink.delete({
            where: { id: linkId },
        });

        return NextResponse.json({
            success: true,
            message: 'Link removido com sucesso',
        });

    } catch (error) {
        console.error('Erro ao remover link:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
});
