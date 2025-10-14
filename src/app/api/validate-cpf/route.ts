import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { successResponse, badRequestResponse, serverErrorResponse } from '@/lib/utils';

// Schema para validação
const validateCpfSchema = z.object({
    cpf: z.string().min(14, 'CPF deve ter 14 caracteres').max(14, 'CPF deve ter 14 caracteres'),
});

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { cpf } = validateCpfSchema.parse(body);

        // Verificar se o CPF já existe
        const existingUser = await prisma.user.findFirst({
            where: {
                cpf: cpf,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (existingUser) {
            return badRequestResponse('CPF já pertence a um usuário');
        }

        return successResponse('CPF disponível para cadastro', {
            available: true,
            cpf: cpf,
        });

    } catch (error) {
        console.error('Erro ao validar CPF:', error);

        if (error instanceof z.ZodError) {
            return badRequestResponse('CPF inválido', error.issues);
        }

        return serverErrorResponse();
    }
};
