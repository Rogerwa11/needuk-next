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

