import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'

interface Experience {
    company: string
    role: string
    details?: string | null
    startDate: Date
    endDate?: Date | null
}

interface Badge {
    badgeId: string
    badgeName: string
    badgeIcon: string | null
    badgeColor: string | null
    description: string | null
    count: number
}

interface Activity {
    id: string
    title: string
    description?: string | null
    status: string
    startDate: Date | string
    endDate?: Date | string | null
}

interface UserData {
    id: string
    name: string
    email: string
    telefone: string
    endereco: string
    cidade: string
    estado: string
    cep: string
    userType: string
    curso?: string | null
    universidade?: string | null
    periodo?: string | null
    aboutMe?: string | null
    experiences: Experience[]
}

interface CurriculumData {
    user: UserData
    activities: Activity[]
    badges: Badge[]
}

export function useCurriculumPDF() {
    const [isGenerating, setIsGenerating] = useState(false)

    const generatePDF = async (data: CurriculumData) => {
        setIsGenerating(true)
        try {
            // Importar dinamicamente o componente PDF para evitar problemas de SSR
            const { CurriculumPDF } = await import('./CurriculumPDF')

            // Criar o documento PDF usando React.createElement para evitar problemas de JSX
            const React = await import('react')
            const doc = React.createElement(CurriculumPDF, { data })

            // Gerar o blob do PDF
            // O tipo do react-pdf não infere corretamente elementos criados dinamicamente
            const blob = await pdf(doc as any).toBlob()

            // Criar URL temporária e fazer download
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `curriculo-${data.user.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Limpar URL temporária
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Erro ao gerar PDF:', error)
            throw error
        } finally {
            setIsGenerating(false)
        }
    }

    return {
        generatePDF,
        isGenerating
    }
}
