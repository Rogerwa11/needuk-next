// Selects comuns do Prisma para evitar repetição

export const userBasicSelect = {
    id: true,
    name: true,
    email: true,
    userType: true,
    image: true,
} as const;

export const userProfileSelect = {
    id: true,
    name: true,
    email: true,
    telefone: true,
    endereco: true,
    cidade: true,
    estado: true,
    cep: true,
    userType: true,
    cpf: true,
    cnpj: true,
    curso: true,
    universidade: true,
    periodo: true,
    nomeEmpresa: true,
    cargo: true,
    setor: true,
    nomeUniversidade: true,
    departamento: true,
    cargoGestor: true,
    plan: true,
    createdAt: true,
    updatedAt: true,
} as const;

export const publicBadgeAwardSelect = {
    id: true,
    badgeId: true,
    badgeName: true,
    badgeIcon: true,
    badgeColor: true,
    createdAt: true,
} as const;


// Select público para o Banco de Talentos (NÃO expõe CPF)
export const publicTalentSelect = {
    id: true,
    name: true,
    email: true,
    telefone: true,
    image: true,
    userType: true,
    endereco: true,
    cidade: true,
    estado: true,
    cep: true,
    cnpj: true,
    curso: true,
    universidade: true,
    periodo: true,
    nomeUniversidade: true,
    departamento: true,
    cargoGestor: true,
    nomeEmpresa: true,
    cargo: true,
    setor: true,
    goldMedals: true,
    silverMedals: true,
    bronzeMedals: true,
    aboutMe: true,
    experiences: {
        select: {
            company: true,
            role: true,
            details: true,
            startDate: true,
            endDate: true,
        },
        orderBy: { startDate: 'desc' as const },
    },
    badgesReceived: {
        select: publicBadgeAwardSelect,
        orderBy: { createdAt: 'desc' as const },
    },
} as const;

export const activityBadgeAwardSelect = {
    id: true,
    badgeId: true,
    badgeName: true,
    badgeDescription: true,
    badgeIcon: true,
    badgeColor: true,
    badgeKeywords: true,
    note: true,
    createdAt: true,
    awardedBy: {
        select: userBasicSelect,
    },
    awardedTo: {
        select: userBasicSelect,
    },
} as const;

export const userBadgeAwardSelect = {
    id: true,
    badgeId: true,
    badgeName: true,
    badgeDescription: true,
    badgeIcon: true,
    badgeColor: true,
    badgeKeywords: true,
    note: true,
    createdAt: true,
    activity: {
        select: {
            id: true,
            title: true,
        },
    },
    awardedBy: {
        select: userBasicSelect,
    },
} as const;

export const activityBasicSelect = {
    id: true,
    title: true,
    description: true,
    status: true,
    startDate: true,
    endDate: true,
    createdAt: true,
    createdBy: true,
    leaderId: true,
} as const;

export const activityDetailSelect = {
    ...activityBasicSelect,
    creator: {
        select: userBasicSelect,
    },
    leader: {
        select: userBasicSelect,
    },
    participants: {
        include: {
            user: {
                select: userBasicSelect,
            },
        },
    },
    observations: {
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    },
    links: {
        orderBy: {
            createdAt: 'asc',
        },
    },
    invitations: {
        include: {
            inviter: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    badgeAwards: {
        orderBy: {
            createdAt: 'desc',
        },
        select: activityBadgeAwardSelect,
    },
    _count: {
        select: {
            participants: true,
            observations: true,
            links: true,
        },
    },
} as const;

export const activityListSelect = {
    ...activityBasicSelect,
    creator: {
        select: userBasicSelect,
    },
    leader: {
        select: userBasicSelect,
    },
    _count: {
        select: {
            participants: true,
        },
    },
} as const;

export const notificationSelect = {
    id: true,
    type: true,
    title: true,
    message: true,
    read: true,
    readAt: true,
    createdAt: true,
    userId: true,
} as const;

