import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

export async function PUT(request: NextRequest) {
    try {
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

        // Obter os dados do corpo da requisição
        const body = await request.json();

        // Validar os dados
        const validatedData = updateProfileSchema.parse(body);

        // Atualizar o perfil no banco de dados
        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
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

        // Retornar os dados atualizados (sem campos sensíveis)
        const userResponse = updatedUser;

        return NextResponse.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            user: userResponse
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);

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

// Método GET para obter dados do perfil (opcional, mas útil para debugging)
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                telefone: true,
                endereco: true,
                cidade: true,
                estado: true,
                cep: true,
                userType: true,
                cpf: true,
                cnpj: true,
                curso: true,
                universidade: true,
                periodo: true,
                nomeEmpresa: true,
                cargo: true,
                setor: true,
                nomeUniversidade: true,
                departamento: true,
                cargoGestor: true,
                plan: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
