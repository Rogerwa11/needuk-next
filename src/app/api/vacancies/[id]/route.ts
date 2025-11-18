import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    badRequestResponse,
    forbiddenResponse,
    notFoundResponse,
    serverErrorResponse,
    successResponse,
    validationErrorResponse,
} from '@/lib/utils';
import { VacancyViewer, mapVacancyUpdateData, projectsVacancyForViewer, vacancyDetailInclude, vacancyUpdateSchema } from '@/lib/vacancies';
import { withAuth, AuthenticatedRequest } from '@/lib/utils';
import { z } from 'zod';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id: vacancyId } = await context.params;
    if (!vacancyId) {
        return badRequestResponse('Identificador da vaga não informado');
    }

    try {
        let viewer: VacancyViewer | null = null;

        try {
            const session = await auth.api.getSession({
                headers: request.headers,
            });

            if (session?.user?.id) {
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: {
                        id: true,
                        userType: true,
                        curso: true,
                    },
                });

                if (user) {
                    viewer = user;
                }
            }
        } catch (error) {
            console.warn('Sessão não disponível ao buscar vaga:', error);
        }

        const vacancy = await prisma.vacancy.findUnique({
            where: { id: vacancyId },
            include: vacancyDetailInclude,
        });

        if (!vacancy) {
            return notFoundResponse('Vaga não encontrada');
        }

        if (vacancy.isDraft && (!viewer || viewer.id !== vacancy.recruiterId)) {
            return forbiddenResponse('Você não tem acesso a esta vaga');
        }

        const projection = projectsVacancyForViewer(vacancy, viewer);

        return successResponse('Vaga encontrada', projection);
    } catch (error) {
        console.error('Erro ao buscar vaga:', error);
        return serverErrorResponse();
    }
}

export const PATCH = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: vacancyId } = await context.params;
    if (!vacancyId) {
        return badRequestResponse('Identificador da vaga não informado');
    }

    try {
        const body = await request.json();
        const parsed = vacancyUpdateSchema.parse(body);

        const hasChanges = Object.values(parsed).some((value) => value !== undefined);
        if (!hasChanges) {
            return badRequestResponse('Nenhuma alteração informada');
        }

        const existing = await prisma.vacancy.findUnique({
            where: { id: vacancyId },
            select: {
                recruiterId: true,
                title: true,
                description: true,
                modality: true,
                seniority: true,
                contractType: true,
                locationCity: true,
                locationState: true,
                locationCountry: true,
                companyName: true,
                skills: true,
                preferredCourses: true,
                benefits: true,
                status: true,
                isDraft: true,
            },
        });

        if (!existing) {
            return notFoundResponse('Vaga não encontrada');
        }

        if (existing.recruiterId !== request.user.id) {
            return forbiddenResponse('Somente o criador da vaga pode editá-la');
        }

        const current = {
            title: existing.title,
            description: existing.description,
            modality: existing.modality,
            seniority: existing.seniority,
            contractType: existing.contractType,
            locationCity: existing.locationCity,
            locationState: existing.locationState,
            locationCountry: existing.locationCountry,
            companyName: existing.companyName,
            skills: existing.skills,
            preferredCourses: existing.preferredCourses,
            benefits: existing.benefits,
        };

        const data = mapVacancyUpdateData(parsed, current);

        if (parsed.status !== undefined && parsed.status !== existing.status) {
            data.closedAt = parsed.status === 'CLOSED' ? new Date() : null;
        }

        const updated = await prisma.vacancy.update({
            where: { id: vacancyId },
            data,
            include: vacancyDetailInclude,
        });

        const projection = projectsVacancyForViewer(updated, {
            id: request.user.id,
            userType: 'recrutador',
        });

        return successResponse('Vaga atualizada com sucesso', projection);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error);
        }

        console.error('Erro ao atualizar vaga:', error);
        return serverErrorResponse();
    }
});

