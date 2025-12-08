import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

interface CurriculumPDFProps {
    data: CurriculumData
}

// Estilos do PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        borderBottomStyle: 'solid',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
    },
    contactInfo: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        borderBottomStyle: 'solid',
    },
    text: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.5,
        marginBottom: 8,
    },
    experienceItem: {
        marginBottom: 15,
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#d1d5db',
        borderLeftStyle: 'solid',
    },
    experienceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    experienceRole: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    experienceCompany: {
        fontSize: 11,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    experienceDate: {
        fontSize: 9,
        color: '#9ca3af',
    },
    experienceDetails: {
        fontSize: 10,
        color: '#4b5563',
        marginTop: 5,
        lineHeight: 1.4,
    },
    activityItem: {
        marginBottom: 12,
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#e5e7eb',
        borderLeftStyle: 'solid',
    },
    activityTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 3,
    },
    activityDescription: {
        fontSize: 9,
        color: '#6b7280',
        marginBottom: 5,
    },
    activityMeta: {
        fontSize: 8,
        color: '#9ca3af',
        flexDirection: 'row',
        gap: 10,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginTop: 5,
    },
    badge: {
        fontSize: 9,
        padding: '4 8',
        borderRadius: 4,
        backgroundColor: '#f3f4f6',
        color: '#374151',
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6b7280',
        width: 100,
    },
    value: {
        fontSize: 10,
        color: '#374151',
        flex: 1,
    },
})

const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export const CurriculumPDF: React.FC<CurriculumPDFProps> = ({ data }) => {
    const { user, activities, badges } = data

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.contactInfo}>{user.email}</Text>
                    <Text style={styles.contactInfo}>{user.telefone}</Text>
                    <Text style={styles.contactInfo}>
                        {user.endereco}, {user.cidade} - {user.estado}, {user.cep}
                    </Text>
                </View>

                {/* Formação Acadêmica - apenas para alunos */}
                {user.userType === 'aluno' && (user.curso || user.universidade || user.periodo) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Formação Acadêmica</Text>
                        {user.curso && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Curso:</Text>
                                <Text style={styles.value}>{user.curso}</Text>
                            </View>
                        )}
                        {user.universidade && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Universidade:</Text>
                                <Text style={styles.value}>{user.universidade}</Text>
                            </View>
                        )}
                        {user.periodo && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Período:</Text>
                                <Text style={styles.value}>{user.periodo}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Sobre Mim */}
                {user.aboutMe && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sobre Mim</Text>
                        <Text style={styles.text}>{user.aboutMe}</Text>
                    </View>
                )}

                {/* Experiências Profissionais */}
                {user.experiences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experiências Profissionais</Text>
                        {user.experiences.map((exp, index) => (
                            <View key={index} style={styles.experienceItem}>
                                <View style={styles.experienceHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.experienceRole}>{exp.role}</Text>
                                        <Text style={styles.experienceCompany}>{exp.company}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.experienceDate}>
                                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Atual'}
                                        </Text>
                                    </View>
                                </View>
                                {exp.details && (
                                    <Text style={styles.experienceDetails}>{exp.details}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Atividades */}
                {activities.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Atividades Participadas</Text>
                        {activities.map((activity) => (
                            <View key={activity.id} style={styles.activityItem}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                {activity.description && (
                                    <Text style={styles.activityDescription}>{activity.description}</Text>
                                )}
                                <View style={styles.activityMeta}>
                                    <Text>
                                        {formatDate(activity.startDate)} - {activity.endDate ? formatDate(activity.endDate) : 'Em andamento'}
                                    </Text>
                                    <Text>
                                        {activity.status === 'completed' ? 'Concluída' : 'Em andamento'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Habilidades e Badges */}
                {badges.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Habilidades e Badges</Text>
                        <View style={styles.badgeContainer}>
                            {badges.map((badge) => (
                                <Text key={badge.badgeId} style={styles.badge}>
                                    {badge.badgeName}
                                    {badge.count > 1 ? ` (×${badge.count})` : ''}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    )
}
