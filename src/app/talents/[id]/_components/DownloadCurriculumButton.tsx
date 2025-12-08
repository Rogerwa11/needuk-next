'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui'
import { useCurriculumPDF } from '@/app/curriculum/_components/useCurriculumPDF'

interface TalentData {
    id: string
    name: string
    email: string
    telefone?: string | null
    endereco?: string | null
    cidade?: string | null
    estado?: string | null
    cep?: string | null
    userType: string
    curso?: string | null
    universidade?: string | null
    periodo?: string | null
    aboutMe?: string | null
    experiences?: Array<{
        company: string
        role: string
        details?: string | null
        startDate: Date | string
        endDate?: Date | string | null
    }>
    badgesReceived?: Array<{
        badgeId: string
        badgeName: string
        badgeIcon?: string | null
        badgeColor?: string | null
        badgeDescription?: string | null
    }>
}

interface Activity {
    id: string
    title: string
    description?: string | null
    status: string
    startDate: Date | string
    endDate?: Date | string | null
}

interface DownloadCurriculumButtonProps {
    talent: TalentData
    activities: Activity[]
}

export function DownloadCurriculumButton({ talent, activities }: DownloadCurriculumButtonProps) {
    const { generatePDF, isGenerating } = useCurriculumPDF()

    const handleDownload = async () => {
        // Agrupar badges por badgeId
        const aggregatedBadges = (() => {
            const grouped = new Map<string, {
                badgeId: string
                badgeName: string
                badgeIcon: string | null
                badgeColor: string | null
                description: string | null
                count: number
            }>()

            const badges = talent.badgesReceived || []
            badges.forEach((badge) => {
                const existing = grouped.get(badge.badgeId)
                if (existing) {
                    existing.count += 1
                } else {
                    grouped.set(badge.badgeId, {
                        badgeId: badge.badgeId,
                        badgeName: badge.badgeName,
                        badgeIcon: badge.badgeIcon ?? null,
                        badgeColor: badge.badgeColor ?? null,
                        description: badge.badgeDescription ?? null,
                        count: 1,
                    })
                }
            })

            return Array.from(grouped.values())
        })()

        // Adaptar dados do talento para o formato esperado pelo PDF
        const pdfData = {
            user: {
                id: talent.id,
                name: talent.name,
                email: talent.email,
                telefone: talent.telefone || '',
                endereco: talent.endereco || '',
                cidade: talent.cidade || '',
                estado: talent.estado || '',
                cep: talent.cep || '',
                userType: talent.userType,
                curso: talent.curso || null,
                universidade: talent.universidade || null,
                periodo: talent.periodo || null,
                aboutMe: talent.aboutMe || null,
                experiences: (talent.experiences || []).map(exp => ({
                    company: exp.company,
                    role: exp.role,
                    details: exp.details || null,
                    startDate: typeof exp.startDate === 'string' ? new Date(exp.startDate) : exp.startDate,
                    endDate: exp.endDate ? (typeof exp.endDate === 'string' ? new Date(exp.endDate) : exp.endDate) : null,
                })),
            },
            activities: activities.map(activity => ({
                id: activity.id,
                title: activity.title,
                description: activity.description || null,
                status: activity.status,
                startDate: typeof activity.startDate === 'string' ? new Date(activity.startDate) : activity.startDate,
                endDate: activity.endDate ? (typeof activity.endDate === 'string' ? new Date(activity.endDate) : activity.endDate) : null,
            })),
            badges: aggregatedBadges,
        }

        await generatePDF(pdfData)
    }

    return (
        <Button
            onClick={handleDownload}
            disabled={isGenerating}
            loading={isGenerating}
            loadingText="Gerando PDF..."
            variant="outline"
            icon={<Download className="w-4 h-4" />}
        >
            Baixar Currículo
        </Button>
    )
}
