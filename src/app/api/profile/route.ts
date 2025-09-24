import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAuth, validationErrorResponse, userProfileSelect, AuthenticatedRequest } from '@/lib/utils';
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/utils';

// Schema para validação dos dados de atualização
const updateProfileSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    telefone: z.string().min(14, 'Telefone é obrigatório'),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    cep: z.string().min(9, 'CEP é obrigatório'),
    // Campos específicos
    image: z.string().optional(),
    curso: z.string().optional(),
    universidade: z.string().optional(),
    periodo: z.string().optional(),
    nomeEmpresa: z.string().optional(),
    cargo: z.string().optional(),
    setor: z.string().optional(),
    nomeUniversidade: z.string().optional(),
    departamento: z.string().optional(),
    cargoGestor: z.string().optional(),
});

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
    try {
        // Obter os dados do corpo da requisição
        const body = await request.json();

        // Validar os dados
        const validatedData = updateProfileSchema.parse(body);

        // Atualizar o perfil no banco de dados
        const updatedUser = await prisma.user.update({
            where: {
                id: request.user.id,
            },
            data: {
                name: validatedData.name,
                image: validatedData.image || null,
                telefone: validatedData.telefone,
                endereco: validatedData.endereco,
                cidade: validatedData.cidade,
                estado: validatedData.estado,
                cep: validatedData.cep,
                curso: validatedData.curso || null,
                universidade: validatedData.universidade || null,
                periodo: validatedData.periodo || null,
                nomeEmpresa: validatedData.nomeEmpresa || null,
                cargo: validatedData.cargo || null,
                setor: validatedData.setor || null,
                nomeUniversidade: validatedData.nomeUniversidade || null,
                departamento: validatedData.departamento || null,
                cargoGestor: validatedData.cargoGestor || null,
            },
        });

        return successResponse('Perfil atualizado com sucesso', { user: updatedUser });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);

        if (error instanceof z.ZodError) {
            return validationErrorResponse(error);
        }

        return serverErrorResponse();
    }
});

// Método GET para obter dados do perfil
export const GET = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: request.user.id },
            select: userProfileSelect,
        });

        if (!user) {
            return notFoundResponse('Usuário não encontrado');
        }

        return successResponse('Perfil obtido com sucesso', { user });

    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        return serverErrorResponse();
    }
});
