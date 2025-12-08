'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Save, Edit2, X, Plus, Trash2, FileText, Briefcase, Award, GraduationCap, User } from 'lucide-react'
import { Button, showSuccess, showError } from '@/components/ui'
import { useApi } from '@/hooks/custom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCurriculumPDF } from './useCurriculumPDF'

interface Experience {
    id?: string
    company: string
    role: string
    details?: string | null
    startDate: string | Date
    endDate?: string | Date | null
}

interface Badge {
    id: string
    badgeId: string
    badgeName: string
    badgeDescription?: string | null
    badgeIcon?: string | null
    badgeColor?: string | null
    badgeKeywords?: string[]
    note?: string | null
    createdAt: string
    activity?: {
        id: string
        title: string
    }
    awardedBy?: {
        id: string
        name: string
    }
}

interface Activity {
    id: string
    title: string
    description?: string | null
    status: string
    startDate: Date | string
    endDate?: Date | string | null
    createdBy: string
    leaderId: string
    creator?: {
        id: string
        name: string
    }
    leader?: {
        id: string
        name: string
    }
    _count?: {
        participants: number
    }
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
    nomeEmpresa?: string | null
    cargo?: string | null
    setor?: string | null
    nomeUniversidade?: string | null
    departamento?: string | null
    cargoGestor?: string | null
    aboutMe?: string | null
    experiences: Experience[]
    badgesReceived: Badge[]
}

interface CurriculumClientProps {
    user: UserData
    activities: Activity[]
}

export function CurriculumClient({ user: initialUser, activities: initialActivities }: CurriculumClientProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [user, setUser] = useState(initialUser)
    const [aboutMe, setAboutMe] = useState(initialUser.aboutMe || '')
    const [experiences, setExperiences] = useState<Experience[]>(
        initialUser.experiences.map(e => ({
            ...e,
            startDate: typeof e.startDate === 'string' ? e.startDate : format(new Date(e.startDate), 'yyyy-MM-dd'),
            endDate: e.endDate ? (typeof e.endDate === 'string' ? e.endDate : format(new Date(e.endDate), 'yyyy-MM-dd')) : ''
        }))
    )

    const updateProfileApi = useApi({
        onSuccess: () => {
            showSuccess('Currículo atualizado com sucesso!')
            setIsEditing(false)
            router.refresh()
        },
        onError: (error) => showError(error || 'Erro ao atualizar currículo')
    })

    const { generatePDF, isGenerating } = useCurriculumPDF()

    // Agrupar badges por badgeId
    const aggregatedBadges = useMemo(() => {
        const grouped = new Map<string, {
            badgeId: string
            badgeName: string
            badgeIcon: string | null
            badgeColor: string | null
            description: string | null
            count: number
        }>()

        user.badgesReceived.forEach((badge) => {
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
    }, [user.badgesReceived])

    const handleSave = async () => {
        const data = {
            name: user.name,
            telefone: user.telefone,
            endereco: user.endereco,
            cidade: user.cidade,
            estado: user.estado,
            cep: user.cep,
            curso: user.curso || undefined,
            universidade: user.universidade || undefined,
            periodo: user.periodo || undefined,
            nomeEmpresa: user.nomeEmpresa || undefined,
            cargo: user.cargo || undefined,
            setor: user.setor || undefined,
            nomeUniversidade: user.nomeUniversidade || undefined,
            departamento: user.departamento || undefined,
            cargoGestor: user.cargoGestor || undefined,
            aboutMe: aboutMe || undefined,
            experiences: experiences.map(e => ({
                company: e.company,
                role: e.role,
                details: e.details || undefined,
                startDate: e.startDate,
                endDate: e.endDate || undefined,
            })),
        }

        await updateProfileApi.execute(() =>
            fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(res => res.json())
        )
    }

    const handleAddExperience = () => {
        setExperiences([...experiences, {
            company: '',
            role: '',
            details: '',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: ''
        }])
    }

    const handleRemoveExperience = (index: number) => {
        setExperiences(experiences.filter((_, i) => i !== index))
    }

    const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
        const updated = [...experiences]
        updated[index] = { ...updated[index], [field]: value }
        setExperiences(updated)
    }

    const handleDownloadPDF = () => {
        generatePDF({
            user: {
                ...user,
                aboutMe,
                experiences: experiences.map(e => ({
                    ...e,
                    startDate: new Date(e.startDate),
                    endDate: e.endDate ? new Date(e.endDate) : null
                }))
            },
            activities: initialActivities,
            badges: aggregatedBadges
        })
    }

    const formatDate = (date: string | Date | null | undefined): string => {
        if (!date) return ''
        const d = typeof date === 'string' ? new Date(date) : date
        if (isNaN(d.getTime())) return ''
        return format(d, 'dd/MM/yyyy', { locale: ptBR })
    }

    return (
        <div className="p-6 min-h-[calc(100vh-50px)]">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Meu Currículo
                        </h1>
                        <p className="text-gray-600">
                            Visualize e edite suas informações profissionais
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={() => {
                                        setIsEditing(false)
                                        setAboutMe(initialUser.aboutMe || '')
                                        setExperiences(
                                            initialUser.experiences.map(e => ({
                                                ...e,
                                                startDate: typeof e.startDate === 'string' ? e.startDate : format(new Date(e.startDate), 'yyyy-MM-dd'),
                                                endDate: e.endDate ? (typeof e.endDate === 'string' ? e.endDate : format(new Date(e.endDate), 'yyyy-MM-dd')) : ''
                                            }))
                                        )
                                    }}
                                    variant="outline"
                                    icon={<X className="w-4 h-4" />}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={updateProfileApi.loading}
                                    loading={updateProfileApi.loading}
                                    loadingText="Salvando..."
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Salvar Alterações
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="outline"
                                    icon={<Edit2 className="w-4 h-4" />}
                                >
                                    Editar
                                </Button>
                                <Button
                                    onClick={handleDownloadPDF}
                                    disabled={isGenerating}
                                    loading={isGenerating}
                                    loadingText="Gerando PDF..."
                                    icon={<Download className="w-4 h-4" />}
                                >
                                    Baixar Currículo
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Dados Pessoais */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-purple-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Dados Pessoais</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input
                                type="text"
                                value={user.name}
                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                                disabled={!isEditing}
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input
                                type="text"
                                value={user.telefone}
                                onChange={(e) => setUser({ ...user, telefone: e.target.value })}
                                disabled={!isEditing}
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                            <input
                                type="text"
                                value={user.endereco}
                                onChange={(e) => setUser({ ...user, endereco: e.target.value })}
                                disabled={!isEditing}
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                            <input
                                type="text"
                                value={user.cidade}
                                onChange={(e) => setUser({ ...user, cidade: e.target.value })}
                                disabled={!isEditing}
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <input
                                type="text"
                                value={user.estado}
                                onChange={(e) => setUser({ ...user, estado: e.target.value })}
                                disabled={!isEditing}
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Formação Acadêmica - apenas para alunos */}
                {user.userType === 'aluno' && (user.curso || user.universidade || user.periodo || isEditing) && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Formação Acadêmica</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                                <input
                                    type="text"
                                    value={user.curso || ''}
                                    onChange={(e) => setUser({ ...user, curso: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Ex: Engenharia de Software"
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Universidade</label>
                                <input
                                    type="text"
                                    value={user.universidade || ''}
                                    onChange={(e) => setUser({ ...user, universidade: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Ex: Universidade Federal"
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                                <input
                                    type="text"
                                    value={user.periodo || ''}
                                    onChange={(e) => setUser({ ...user, periodo: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Ex: 5º período"
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Sobre Mim */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Sobre Mim</h2>
                    </div>
                    <textarea
                        value={aboutMe}
                        onChange={(e) => setAboutMe(e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Descreva suas habilidades, objetivos profissionais e experiências..."
                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                </div>

                {/* Experiências Profissionais */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Experiências Profissionais</h2>
                        </div>
                        {isEditing && (
                            <Button
                                onClick={handleAddExperience}
                                variant="outline"
                                size="sm"
                                icon={<Plus className="w-4 h-4" />}
                            >
                                Adicionar Experiência
                            </Button>
                        )}
                    </div>
                    {experiences.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhuma experiência cadastrada</p>
                    ) : (
                        <div className="space-y-4">
                            {experiences.map((exp, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                disabled={!isEditing}
                                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                                            <input
                                                type="text"
                                                value={exp.role}
                                                onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                                                disabled={!isEditing}
                                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                                            <input
                                                type="date"
                                                value={typeof exp.startDate === 'string' ? exp.startDate : format(new Date(exp.startDate), 'yyyy-MM-dd')}
                                                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                                disabled={!isEditing}
                                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
                                            <input
                                                type="date"
                                                value={exp.endDate ? (typeof exp.endDate === 'string' ? exp.endDate : format(new Date(exp.endDate), 'yyyy-MM-dd')) : ''}
                                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Em andamento"
                                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                        <textarea
                                            value={exp.details || ''}
                                            onChange={(e) => handleExperienceChange(index, 'details', e.target.value)}
                                            disabled={!isEditing}
                                            rows={2}
                                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>
                                    {isEditing && (
                                        <Button
                                            onClick={() => handleRemoveExperience(index)}
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            icon={<Trash2 className="w-4 h-4" />}
                                        >
                                            Remover
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Atividades */}
                {initialActivities.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Atividades Participadas</h2>
                        </div>
                        <div className="space-y-4">
                            {initialActivities.map((activity) => (
                                <div key={activity.id} className="border-l-4 border-purple-500 pl-4 py-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                            {activity.description && (
                                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>Início: {formatDate(activity.startDate)}</span>
                                                {activity.endDate && <span>Término: {formatDate(activity.endDate)}</span>}
                                                <span className={`px-2 py-1 rounded ${activity.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {activity.status === 'completed' ? 'Concluída' : 'Em andamento'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Badges/Habilidades */}
                {aggregatedBadges.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Habilidades e Badges</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {aggregatedBadges.map((badge) => (
                                <div
                                    key={badge.badgeId}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
                                    style={{
                                        borderColor: badge.badgeColor || '#c4b5fd',
                                        color: badge.badgeColor || '#6b21a8',
                                        backgroundColor: badge.badgeColor ? `${badge.badgeColor}15` : '#faf5ff'
                                    }}
                                >
                                    <span>{badge.badgeIcon || '🏅'}</span>
                                    <span>{badge.badgeName}</span>
                                    {badge.count > 1 && (
                                        <span className="text-xs opacity-75">×{badge.count}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
