import { prisma } from '@/lib/prisma'
import {
    withAuth,
    AuthenticatedRequest,
    activityBadgeAwardSelect,
    successResponse,
    serverErrorResponse,
    notFoundResponse,
    forbiddenResponse,
    badRequestResponse,
    validationErrorResponse,
} from '@/lib/utils'
import { BADGE_MAP } from '@/constants/badges'
import { z } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

const awardBadgeSchema = z.object({
    badgeId: z.string().min(1, 'Emblema é obrigatório'),
    awardedToId: z.string().min(1, 'Destinatário é obrigatório'),
    note: z
        .string()
        .max(280, 'Limite máximo de 280 caracteres')
        .optional(),
})

export const POST = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const { badgeId, awardedToId, note } = awardBadgeSchema.parse(await request.json())
        const { id: activityId } = await params

        if (awardedToId === request.user.id) {
            return forbiddenResponse('Você não pode conceder um emblema para si mesmo.')
        }

        const badge = BADGE_MAP[badgeId]
        if (!badge) {
            return badRequestResponse('Emblema selecionado é inválido.')
        }

        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                participants: {
                    where: {
                        userId: {
                            in: [request.user.id, awardedToId],
                        },
                    },
                    select: {
                        userId: true,
                    },
                },
            },
        })

        if (!activity) {
            return notFoundResponse('Atividade não encontrada.')
        }

        const isGiverParticipant = activity.participants.some((participant) => participant.userId === request.user.id)
        const isRecipientParticipant = activity.participants.some((participant) => participant.userId === awardedToId)

        if (!isGiverParticipant) {
            return forbiddenResponse('Você precisa participar da atividade para conceder emblemas.')
        }

        if (!isRecipientParticipant) {
            return badRequestResponse('O usuário selecionado não participa desta atividade.')
        }

        const currentAwards = await prisma.activityBadgeAward.count({
            where: {
                activityId,
                awardedById: request.user.id,
                awardedToId,
            },
        })

        if (currentAwards >= 2) {
            return badRequestResponse('Você já concedeu o máximo de 2 emblemas para esta pessoa nesta atividade.')
        }

        const duplicatedBadge = await prisma.activityBadgeAward.findFirst({
            where: {
                activityId,
                awardedById: request.user.id,
                awardedToId,
                badgeId,
            },
        })

        if (duplicatedBadge) {
            return badRequestResponse('Você já concedeu este emblema para esta pessoa nesta atividade.')
        }

        const award = await prisma.activityBadgeAward.create({
            data: {
                activityId,
                badgeId,
                badgeName: badge.name,
                badgeDescription: badge.description,
                badgeIcon: badge.icon,
                badgeColor: badge.color,
                badgeKeywords: badge.keywords,
                awardedById: request.user.id,
                awardedToId,
                note: note?.trim() ? note.trim() : null,
            },
            select: activityBadgeAwardSelect,
        })

        return successResponse('Emblema concedido com sucesso', { award })
    } catch (error) {
        console.error('Erro ao conceder emblema:', error)

        if (error instanceof z.ZodError) {
            return validationErrorResponse(error)
        }

        return serverErrorResponse()
    }
})


