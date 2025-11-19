import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
}

export interface AuthenticatedRequest extends NextRequest {
    user: AuthenticatedUser;
}

export const withAuth = (
    handler: (request: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>
) => {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
        try {
            const session = await auth.api.getSession({
                headers: request.headers,
            });

            if (!session?.user?.id) {
                return NextResponse.json(
                    { error: 'Não autorizado' },
                    { status: 401 }
                );
            }

            const authenticatedRequest = request as AuthenticatedRequest;
            authenticatedRequest.user = {
                id: session.user.id,
                name: session.user.name || '',
                email: session.user.email || '',
            };

            return handler(authenticatedRequest, ...args);
        } catch (error) {
            console.error('Erro na autenticação:', error);
            return NextResponse.json(
                { error: 'Erro interno do servidor' },
                { status: 500 }
            );
        }
    };
};

export const withPermission = (
    userId: string,
    requiredUserId: string,
    customMessage?: string
) => {
    if (userId !== requiredUserId) {
        return NextResponse.json(
            { error: customMessage || 'Você não tem permissão para esta ação' },
            { status: 403 }
        );
    }
    return null;
};

export const ensureSameUser = (
    requestUserId: string,
    targetUserId: string | null | undefined,
    customMessage?: string
) => {
    if (!targetUserId) {
        return NextResponse.json(
            { error: 'Identificador de usuário inválido' },
            { status: 400 }
        );
    }

    if (requestUserId !== targetUserId) {
        return NextResponse.json(
            { error: customMessage || 'Você não tem permissão para acessar este recurso' },
            { status: 403 }
        );
    }

    return null;
};
