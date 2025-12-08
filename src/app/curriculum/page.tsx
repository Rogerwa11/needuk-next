import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { userProfileSelect, userBadgeAwardSelect, activityListSelect } from '@/lib/utils/prisma-selects'
import { CurriculumClient } from './_components/CurriculumClient'

export default async function CurriculumPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect('/')
    }

    // Verificar se o usuário tem permissão (apenas aluno e gestor)
    if (!['aluno', 'gestor'].includes(session.user.userType || '')) {
        redirect('/dashboard')
    }

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            ...userProfileSelect,
            aboutMe: true,
            experiences: {
                select: {
                    id: true,
                    company: true,
                    role: true,
                    details: true,
                    startDate: true,
                    endDate: true
                },
                orderBy: { startDate: 'desc' as const },
            },
            badgesReceived: {
                select: userBadgeAwardSelect,
                orderBy: { createdAt: 'desc' as const },
            },
        } as any,
    })

    if (!user) {
        redirect('/')
    }

    // Buscar atividades onde o usuário é participante, líder ou criador
    const activities = await prisma.activity.findMany({
        where: {
            OR: [
                { createdBy: session.user.id },
                { leaderId: session.user.id },
                { participants: { some: { userId: session.user.id } } }
            ]
        },
        select: activityListSelect as any,
        orderBy: { startDate: 'desc' as const },
    })

    // Cast do tipo para UserData (todos os campos necessários estão presentes)
    return <CurriculumClient user={user as any} activities={activities as any} />
}