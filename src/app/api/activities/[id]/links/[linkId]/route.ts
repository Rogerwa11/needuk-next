import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string; linkId: string }>;
}

// DELETE - Remover link específico
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
                userId: session.user.id,
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
}
