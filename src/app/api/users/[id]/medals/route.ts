import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/utils';
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Buscar medalhas do usuário
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                userType: true,
                goldMedals: true,
                silverMedals: true,
                bronzeMedals: true,
            }
        });

        if (!user) {
            return notFoundResponse('Usuário não encontrado');
        }

        return successResponse('Medalhas obtidas com sucesso', {
            user: {
                id: user.id,
                name: user.name,
                userType: user.userType,
                goldMedals: user.goldMedals,
                silverMedals: user.silverMedals,
                bronzeMedals: user.bronzeMedals,
                totalMedals: user.goldMedals + user.silverMedals + user.bronzeMedals,
            },
        });

    } catch (error) {
        console.error('Erro ao buscar medalhas do usuário:', error);
        return serverErrorResponse();
    }
});
