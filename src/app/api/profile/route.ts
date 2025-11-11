import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAuth, validationErrorResponse, userProfileSelect, userBadgeAwardSelect, AuthenticatedRequest } from '@/lib/utils';
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/utils';
import { validationUtils } from '@/utils/validation-helpers';

// Schema para validação dos dados de atualização
// Helpers para datas (aceita 'YYYY-MM-DD' ou ISO)
const parseDate = (value: unknown): Date => {
    const s = String(value || '');
    const iso = s.length === 10 ? `${s}T00:00:00Z` : s;
    return new Date(iso);
};
const isParsableDate = (value: unknown): boolean => {
    const d = parseDate(value);
    return !isNaN(d.getTime());
};

const experienceSchema = z.object({
    company: z.string().min(1, 'Empresa é obrigatória').max(120),
    role: z.string().min(1, 'Função é obrigatória').max(120),
    details: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
    startDate: z.string().min(1, 'Data inicial é obrigatória').refine(isParsableDate, 'Data inicial inválida'),
    endDate: z.preprocess((v) => (v === '' || v == null ? undefined : v), z.string().optional().refine((v) => v === undefined || isParsableDate(v), 'Data final inválida')),
}).refine(v => !v.endDate || parseDate(v.endDate) > parseDate(v.startDate), {
    message: 'Data de término deve ser posterior à data de início', path: ['endDate']
});

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    telefone: z.string()
        .min(14, 'Telefone é obrigatório')
        .refine((telefone) => {
            // Remove formatação para validar
            const cleaned = telefone.replace(/\D/g, '');
            return cleaned.length === 10 || cleaned.length === 11; // Telefones: 10 dígitos (fixo) ou 11 dígitos (celular)
        }, 'Telefone deve ter 10 ou 11 dígitos')
        .refine(validationUtils.isValidPhone, 'Telefone inválido'),
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
    aboutMe: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
    experiences: z.array(experienceSchema).max(20, 'Máximo de 20 experiências').optional(),
});

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
    try {
        // Obter os dados do corpo da requisição
        const body = await request.json();

        // Validar os dados
        const validatedData = updateProfileSchema.parse(body);

        // Atualizar o perfil no banco de dados
        // Atualizar user + sobre/experiências em transação
        const updatedUser = await prisma.$transaction(async (tx) => {
            // Atualiza dados básicos e aboutMe
            const user = await tx.user.update({
                where: { id: request.user.id },
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
                    // aboutMe ainda não existe nos tipos locais até gerar Prisma; cast para any
                    ...({ aboutMe: validatedData.aboutMe || null } as any),
                } as any,
                select: ({
                    ...userProfileSelect,
                    badgesReceived: {
                        select: userBadgeAwardSelect,
                        orderBy: { createdAt: 'desc' as const },
                    },
                } as any),
            });

            // Se experiências foram enviadas, substituir todas do usuário
            if (validatedData.experiences) {
                await (tx as any).experience.deleteMany({ where: { userId: request.user.id } });
                if (validatedData.experiences.length > 0) {
                    await (tx as any).experience.createMany({
                        data: validatedData.experiences.map((e) => ({
                            userId: request.user.id,
                            company: e.company,
                            role: e.role,
                            details: e.details || null,
                            startDate: parseDate(e.startDate),
                            endDate: e.endDate ? parseDate(e.endDate) : null,
                        })),
                    });
                }
            }
            return user;
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
            select: ({
                ...userProfileSelect,
                aboutMe: true,
                experiences: {
                    select: { id: true, company: true, role: true, details: true, startDate: true, endDate: true },
                    orderBy: { startDate: 'desc' as const },
                },
                badgesReceived: {
                    select: userBadgeAwardSelect,
                    orderBy: { createdAt: 'desc' as const },
                },
            } as any),
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
