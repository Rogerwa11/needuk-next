// Regras de validação comuns

export const validationRules = {
    name: {
        minLength: 2,
        maxLength: 100,
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
    },
    phone: {
        pattern: /^\(\d{2}\) \d{5}-\d{4}$/,
        length: 15, // (11) 99999-9999
    },
    cpf: {
        pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        length: 14,
    },
    cnpj: {
        pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
        length: 18,
    },
    cep: {
        pattern: /^\d{5}-\d{3}$/,
        length: 9,
    },
    activity: {
        title: {
            minLength: 1,
            maxLength: 200,
        },
        description: {
            maxLength: 1000,
        },
    },
    observation: {
        maxLength: 1000,
    },
    link: {
        title: {
            maxLength: 100,
        },
        url: {
            pattern: /^https?:\/\/.+/,
        },
    },
    file: {
        image: {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
    },
};

// Regras específicas por tipo de usuário
export const userTypeRules = {
    aluno: {
        requiredFields: ['cpf', 'curso', 'universidade', 'periodo'],
    },
    recrutador: {
        requiredFields: ['nomeEmpresa', 'cargo', 'setor'],
        documentRequired: true, // CPF ou CNPJ
    },
    gestor: {
        requiredFields: ['nomeUniversidade', 'departamento', 'cargoGestor'],
        documentRequired: true, // CPF ou CNPJ
    },
};

// Estados brasileiros
export const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Tipos de medalhas
export const medalTypes = {
    BRONZE: 'bronze',
    SILVER: 'prata',
    GOLD: 'ouro',
} as const;

// Tipos de usuário
export const userTypes = {
    ALUNO: 'aluno',
    RECRUTADOR: 'recrutador',
    GESTOR: 'gestor',
} as const;

// Status de atividade
export const activityStatuses = {
    PENDING: 'pending',
    COMPLETED: 'completed',
} as const;

// Tipos de notificação
export const notificationTypes = {
    SYSTEM: 'system',
    ACTIVITY_UPDATE: 'activity_update',
    INVITATION: 'invitation',
    MEDAL_AWARDED: 'medal_awarded',
} as const;

// Planos disponíveis
export const plans = {
    FREE: 'free',
    PLUS: 'plus',
    PREMIUM: 'premium',
    PRO: 'pro',
} as const;
