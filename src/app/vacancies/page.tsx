import { cookies, headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VacanciesClient } from './_components/VacanciesClient';

interface VacanciesPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : {};

    const incomingHeaders = await headers();
    let viewer: Awaited<ReturnType<typeof getViewerInfo>> | null = null;

    try {
        const session = await auth.api.getSession({ headers: incomingHeaders });
        if (session?.user?.id) {
            viewer = await getViewerInfo(session.user.id);
        }
    } catch (error) {
        console.warn('Não foi possível recuperar a sessão do usuário na listagem de vagas:', error);
    }

    const query = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => {
                if (v) query.append(key, v);
            });
        } else if (value) {
            query.set(key, value);
        }
    });

    if (!query.has('page')) query.set('page', '1');
    if (!query.has('pageSize')) query.set('pageSize', '12');

    let initialData: any = null;
    try {
        const host = incomingHeaders.get('host');
        const protocol = host && !host.includes('localhost') ? 'https' : 'http';
        const baseUrl = process.env.NEXT_PUBLIC_URL ?? (host ? `${protocol}://${host}` : 'http://localhost:3000');
        const cookieHeader = (await cookies()).toString();
        const response = await fetch(`${baseUrl}/api/vacancies?${query.toString()}`, {
            headers: {
                cookie: cookieHeader,
            },
            cache: 'no-store',
        });

        const payload = await response.json();
        if (response.ok && payload?.data) {
            initialData = payload.data;
        }
    } catch (error) {
        console.warn('Falha ao buscar vagas iniciais no servidor:', error);
    }

    return (
        <VacanciesClient
            initialViewer={viewer}
            initialData={initialData}
            initialParams={resolvedSearchParams}
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
            nomeEmpresa: true,
        },
    });

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.name ?? '',
        email: user.email,
        userType: user.userType,
        curso: user.curso,
        nomeEmpresa: user.nomeEmpresa,
    };
}
