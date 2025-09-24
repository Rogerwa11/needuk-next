import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para criação de link
const createLinkSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
    url: z.string().url('URL inválida'),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Listar links da atividade
export async function GET(request: NextRequest, { params }: RouteParams) {
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

        // Verificar se a atividade existe e se o usuário é participante
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
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

        if (activity.participants.length === 0) {
            return NextResponse.json(
                { error: 'Você não é participante desta atividade' },
                { status: 403 }
            );
        }

        // Buscar links
        const links = await prisma.activityLink.findMany({
            where: { activityId },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json({
            links,
            total: links.length
        });

    } catch (error) {
        console.error('Erro ao buscar links:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST - Criar novo link
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
        const { title, url } = createLinkSchema.parse(body);

        // Verificar se a atividade existe e se o usuário é participante
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                title: true,
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

        if (activity.participants.length === 0) {
            return NextResponse.json(
                { error: 'Você não é participante desta atividade' },
                { status: 403 }
            );
        }

        // Criar link
        const link = await prisma.activityLink.create({
            data: {
                activityId,
                title,
                url,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Link adicionado com sucesso',
            link,
        });

    } catch (error) {
        console.error('Erro ao criar link:', error);

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
