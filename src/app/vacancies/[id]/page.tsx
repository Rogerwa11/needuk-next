import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { projectsVacancyForViewer, vacancyDetailInclude } from '@/lib/vacancies';
import { VacancyDetailClient } from '../_components/VacancyDetailClient';

interface VacancyDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function VacancyDetailPage({ params }: VacancyDetailPageProps) {
    const { id } = await params;
    if (!id) {
        notFound();
    }

    const incomingHeaders = await headers();

    let viewer: Awaited<ReturnType<typeof getViewerInfo>> | null = null;
    try {
        const session = await auth.api.getSession({ headers: incomingHeaders });
        if (session?.user?.id) {
            viewer = await getViewerInfo(session.user.id);
        }
    } catch (error) {
        console.warn('Não foi possível recuperar a sessão ao carregar a vaga:', error);
    }

    const vacancy = await prisma.vacancy.findUnique({
        where: { id },
        include: vacancyDetailInclude,
    });

    if (!vacancy) {
        notFound();
    }

    if (vacancy.isDraft && (!viewer || viewer.id !== vacancy.recruiterId)) {
        notFound();
    }

    const projection = projectsVacancyForViewer(vacancy, viewer ? { id: viewer.id, userType: viewer.userType, curso: viewer.curso } : null);

    return (
        <VacancyDetailClient
            initialData={serializeProjection(projection)}
            viewer={viewer ? serializeViewer(viewer) : null}
        />
    );
}

async function getViewerInfo(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            curso: true,
        },
    });

    return user;
}

function serializeProjection(projection: ReturnType<typeof projectsVacancyForViewer>) {
    const { vacancy, applications, permissions } = projection;
    const serializedApplications = applications.map(serializeApplication);
    return {
        vacancy: {
            ...vacancy,
            createdAt: vacancy.createdAt.toISOString(),
            updatedAt: vacancy.updatedAt.toISOString(),
            deadline: vacancy.deadline ? vacancy.deadline.toISOString() : null,
            closedAt: vacancy.closedAt ? vacancy.closedAt.toISOString() : null,
            status: vacancy.status as 'OPEN' | 'CLOSED',
            applications: serializedApplications,
            recruiter: {
                ...vacancy.recruiter,
                telefone: vacancy.recruiter.telefone ?? null,
            },
        },
        applications: serializedApplications,
        permissions,
    };
}

function serializeApplication(application: any) {
    return {
        ...application,
        appliedAt: application.appliedAt ? application.appliedAt.toISOString() : null,
        decidedAt: application.decidedAt ? application.decidedAt.toISOString() : null,
        status: application.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
    };
}

function serializeViewer(viewer: NonNullable<Awaited<ReturnType<typeof getViewerInfo>>>) {
    return {
        id: viewer.id,
        name: viewer.name ?? null,
        email: viewer.email,
        userType: viewer.userType,
        curso: viewer.curso ?? null,
    };
}

