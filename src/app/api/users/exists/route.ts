import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const requestSchema = z.object({
    emails: z.array(z.string().email('Email inválido')).nonempty('Informe ao menos um email').max(100, 'Máximo de 100 emails')
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: 'Dados inválidos',
                    details: parsed.error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }))
                },
                { status: 400 }
            );
        }

        // normalizar e deduplicar
        const normalized = Array.from(
            new Set(parsed.data.emails.map(e => e.toLowerCase().trim()).filter(Boolean))
        );

        if (normalized.length === 0) {
            return NextResponse.json({ found: [], notFound: [] });
        }

        const users = await prisma.user.findMany({
            where: { email: { in: normalized } },
            select: { email: true },
        });

        const found = users.map(u => u.email);
        const foundSet = new Set(found);
        const notFound = normalized.filter(e => !foundSet.has(e));

        return NextResponse.json({ found, notFound });
    } catch (error) {
        console.error('Erro em users/exists:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}


