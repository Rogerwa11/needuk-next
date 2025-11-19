import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createdResponse, forbiddenResponse, serverErrorResponse, successResponse, validationErrorResponse } from '@/lib/utils';
import { ensureRecruiterUser, mapVacancyCreateData, normalizeVacancyFilters, sortVacanciesByPreference, vacancyListInclude, vacancyWriteSchema, VacancyViewer, buildVacancyWhere, canUserApply, notifyVacancyPublished } from '@/lib/vacancies';
import { withAuth, AuthenticatedRequest } from '@/lib/utils';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const filters = normalizeVacancyFilters(url.searchParams);

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
            console.warn('Sessão não disponível para listagem de vagas:', error);
        }

        const viewerId = viewer?.id ?? null;
        const canViewerSeeAccepted = viewer ? canUserApply(viewer) && !filters.mine : false;
        let acceptedVacancyIds: string[] = [];
        if (canViewerSeeAccepted && viewerId) {
            const acceptedApplications = await prisma.vacancyApplication.findMany({
                where: {
                    applicantId: viewerId,
                    status: 'ACCEPTED',
                },
                select: {
                    vacancyId: true,
                },
            });
            acceptedVacancyIds = acceptedApplications.map((application) => application.vacancyId);
        }

        const generalAcceptedMode = canViewerSeeAccepted && acceptedVacancyIds.length > 0 ? 'exclude' : 'default';
        const where = buildVacancyWhere(filters, viewer, {
            acceptedVacancyIds,
            acceptedMode: generalAcceptedMode,
        });
        const take = filters.page * filters.pageSize;
        const skip = (filters.page - 1) * filters.pageSize;

        const [generalTotal, generalItems] = await prisma.$transaction([
            prisma.vacancy.count({ where }),
            prisma.vacancy.findMany({
                where,
                include: vacancyListInclude,
                orderBy: { createdAt: 'desc' },
                take,
            }),
        ]);

        let acceptedItems: typeof generalItems = [];
        if (canViewerSeeAccepted && acceptedVacancyIds.length > 0) {
            const acceptedWhere = buildVacancyWhere(filters, viewer, {
                acceptedVacancyIds,
                acceptedMode: 'only',
            });
            acceptedItems = await prisma.vacancy.findMany({
                where: acceptedWhere,
                include: vacancyListInclude,
                orderBy: { createdAt: 'desc' },
            });
        }

        const courseForOrdering = filters.course ?? viewer?.curso ?? null;
        const acceptedSet = new Set(acceptedItems.map((item) => item.id));
        const combinedItems = [
            ...acceptedItems,
            ...generalItems.filter((item) => !acceptedSet.has(item.id)),
        ];
        const prioritizedIds = Array.from(acceptedSet);
        const ordered = sortVacanciesByPreference(combinedItems, courseForOrdering, prioritizedIds);
        const paginatedItems = ordered.slice(skip, skip + filters.pageSize);
        const total = generalTotal + acceptedItems.length;

        let viewerApplications: Record<string, { status: string; id: string }> = {};
        if (viewer && paginatedItems.length > 0) {
            const applications = await prisma.vacancyApplication.findMany({
                where: {
                    applicantId: viewer.id,
                    vacancyId: { in: paginatedItems.map((vacancy) => vacancy.id) },
                },
                select: {
                    id: true,
                    vacancyId: true,
                    status: true,
                },
            });
            viewerApplications = applications.reduce<Record<string, { status: string; id: string }>>((acc, application) => {
                acc[application.vacancyId] = {
                    status: application.status,
                    id: application.id,
                };
                return acc;
            }, {});
        }

        const enrichedItems = paginatedItems.map((vacancy) => ({
            ...vacancy,
            viewerState: viewer
                ? {
                    canEdit: viewer.id === vacancy.recruiterId,
                    canApply: vacancy.status === 'OPEN' && !vacancy.isDraft && canUserApply(viewer),
                    application: viewerApplications[vacancy.id] ?? null,
                }
                : null,
        }));

        return successResponse('Vagas recuperadas com sucesso', {
            items: enrichedItems,
            total,
            page: filters.page,
            pageSize: filters.pageSize,
            hasMore: skip + filters.pageSize < total,
            filters,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error);
        }

        console.error('Erro ao listar vagas:', error);
        return serverErrorResponse();
    }
}

export const POST = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json();
        const parsed = vacancyWriteSchema.parse(body);

        try {
            await ensureRecruiterUser(request.user.id);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'USER_NOT_FOUND') {
                    return forbiddenResponse('Usuário não encontrado para criar a vaga');
                }
                if (error.message === 'USER_NOT_RECRUITER') {
                    return forbiddenResponse('Somente recrutadores podem criar vagas');
                }
            }
            throw error;
        }

        const data = mapVacancyCreateData(parsed, request.user.id);
        const vacancy = await prisma.vacancy.create({
            data,
            include: vacancyListInclude,
        });

        if (!vacancy.isDraft && vacancy.status === 'OPEN') {
            await notifyVacancyPublished({ id: vacancy.id, title: vacancy.title });
        }

        return createdResponse('Vaga criada com sucesso', { vacancy });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error);
        }
        console.error('Erro ao criar vaga:', error);
        return serverErrorResponse();
    }
});

