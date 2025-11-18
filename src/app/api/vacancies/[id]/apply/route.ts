import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
    badRequestResponse,
    conflictResponse,
    forbiddenResponse,
    notFoundResponse,
    serverErrorResponse,
    successResponse,
    validationErrorResponse,
} from '@/lib/utils';
import { AuthenticatedRequest, withAuth } from '@/lib/utils';

const applySchema = z.object({
    coverLetter: z.string().trim().max(2000).optional(),
    resumeUrl: z.string().trim().url().optional(),
    portfolioUrl: z.string().trim().url().optional(),
    additionalInfo: z.string().trim().max(2000).optional(),
});

export const POST = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: vacancyId } = await context.params;

    if (!vacancyId) {
        return badRequestResponse('Vaga inválida');
    }

    try {
        let body: unknown = {};
        try {
            body = await request.json();
        } catch {
            body = {};
        }

        const payload = applySchema.parse(body);

        const applicant = await prisma.user.findUnique({
            where: { id: request.user.id },
            select: {
                id: true,
                name: true,
                userType: true,
            },
        });

        if (!applicant) {
            return notFoundResponse('Usuário não encontrado');
        }

        if (!['aluno', 'gestor'].includes(applicant.userType)) {
            return forbiddenResponse('Somente alunos ou gestores podem se candidatar a vagas');
        }

        const vacancy = await prisma.vacancy.findUnique({
            where: { id: vacancyId },
            select: {
                id: true,
                title: true,
                status: true,
                isDraft: true,
                recruiterId: true,
            },
        });

        if (!vacancy || vacancy.isDraft) {
            return notFoundResponse('Vaga não encontrada');
        }

        if (vacancy.status !== 'OPEN') {
            return forbiddenResponse('Esta vaga não está aberta para candidaturas');
        }

        if (vacancy.recruiterId === applicant.id) {
            return forbiddenResponse('O criador da vaga não pode se candidatar');
        }

        const existingApplication = await prisma.vacancyApplication.findUnique({
            where: {
                vacancyId_applicantId: {
                    vacancyId,
                    applicantId: applicant.id,
                },
            },
        });

        if (existingApplication) {
            return conflictResponse('Você já se candidatou a esta vaga');
        }

        const application = await prisma.vacancyApplication.create({
            data: {
                vacancyId,
                applicantId: applicant.id,
                coverLetter: payload.coverLetter ?? null,
                resumeUrl: payload.resumeUrl ?? null,
                portfolioUrl: payload.portfolioUrl ?? null,
                additionalInfo: payload.additionalInfo ?? null,
            },
            select: {
                id: true,
            },
        });

        await prisma.notification.create({
            data: {
                userId: vacancy.recruiterId,
                type: 'system',
                title: 'Nova candidatura recebida',
                message: `${applicant.name || 'Um candidato'} se candidatou à vaga "${vacancy.title}".`,
            },
        });

        return successResponse('Candidatura registrada com sucesso', {
            applicationId: application.id,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error);
        }

        console.error('Erro ao criar candidatura:', error);
        return serverErrorResponse();
    }
});

