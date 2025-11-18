import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { vacancyListInclude } from '@/lib/vacancies';
import { ManageVacanciesClient } from '../_components/ManageVacanciesClient';

interface ManagePageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ManageVacanciesPage({ searchParams }: ManagePageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const incomingHeaders = await headers();

    const session = await auth.api.getSession({ headers: incomingHeaders });
    if (!session?.user?.id) {
        redirect('/login?redirect=/vacancies/manage');
    }

    const viewer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            nomeEmpresa: true,
        },
    });

    if (!viewer || viewer.userType !== 'recrutador') {
        redirect('/vacancies');
    }

    const vacancies = await prisma.vacancy.findMany({
        where: {
            recruiterId: viewer.id,
        },
        include: vacancyListInclude,
        orderBy: {
            createdAt: 'desc',
        },
    });

    const initialEditId = getParam(resolvedSearchParams, 'edit');

    return (
        <ManageVacanciesClient
            initialViewer={{
                id: viewer.id,
                name: viewer.name,
                email: viewer.email,
                nomeEmpresa: viewer.nomeEmpresa,
            }}
            initialVacancies={vacancies.map(serializeVacancy)}
            initialEditId={initialEditId}
        />
    );
}

function serializeVacancy(vacancy: any) {
    return {
        ...vacancy,
        createdAt: vacancy.createdAt.toISOString(),
        updatedAt: vacancy.updatedAt.toISOString(),
        deadline: vacancy.deadline ? vacancy.deadline.toISOString() : null,
    };
}

function getParam(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
    const value = params[key];
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}

