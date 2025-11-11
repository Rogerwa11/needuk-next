import { NextRequest } from 'next/server'
import { BADGES } from '@/constants/badges'
import { withAuth, AuthenticatedRequest, successResponse, serverErrorResponse } from '@/lib/utils'

const normalize = (value: string) =>
    value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()

export const GET = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')?.trim()

        const filteredBadges = (() => {
            if (!query) {
                return BADGES
            }

            const tokens = query
                .split(/\s+/)
                .map((token) => token.trim())
                .filter(Boolean)
                .map(normalize)

            if (tokens.length === 0) {
                return BADGES
            }

            return BADGES.filter((badge) => {
                const haystack = [
                    badge.name,
                    badge.description,
                    badge.icon,
                    ...badge.keywords,
                ]
                    .map(normalize)
                    .join(' ')

                return tokens.every((token) => haystack.includes(token))
            })
        })()

        return successResponse('Emblemas carregados com sucesso', {
            badges: filteredBadges,
        })
    } catch (error) {
        console.error('Erro ao listar emblemas:', error)
        return serverErrorResponse()
    }
})


