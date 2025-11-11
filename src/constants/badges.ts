export type BadgeDefinition = {
    id: string
    name: string
    description: string
    icon: string
    color: string
    keywords: string[]
}

export const BADGES: BadgeDefinition[] = [
    {
        id: 'teamwork',
        name: 'Trabalho em Grupo',
        description: 'Reconhece quem colabora ativamente com o time e fortalece o espírito de equipe.',
        icon: '🤝',
        color: '#6366F1',
        keywords: ['colaboração', 'grupo', 'time', 'cooperação', 'coletivo', 'ajuda'],
    },
    {
        id: 'innovator',
        name: 'Inovador',
        description: 'Premia quem apresenta ideias originais e soluções criativas para os desafios.',
        icon: '💡',
        color: '#10B981',
        keywords: ['criatividade', 'inovação', 'ideias', 'original', 'criativo'],
    },
    {
        id: 'fast-thinker',
        name: 'Pensa Rápido',
        description: 'Destaca quem toma decisões ágeis mantendo a qualidade do trabalho.',
        icon: '⚡',
        color: '#F59E0B',
        keywords: ['rápido', 'agilidade', 'decisão', 'veloz', 'resposta'],
    },
    {
        id: 'problem-solver',
        name: 'Resolve Problemas',
        description: 'Valoriza quem identifica problemas e encontra soluções eficientes.',
        icon: '🧠',
        color: '#3B82F6',
        keywords: ['solução', 'resolver', 'problema', 'analítico', 'investigativo'],
    },
    {
        id: 'leadership',
        name: 'Liderança',
        description: 'Reconhece quem inspira, organiza e apoia o time rumo aos objetivos.',
        icon: '👑',
        color: '#8B5CF6',
        keywords: ['líder', 'organização', 'inspiração', 'ajuda', 'condução'],
    },
    {
        id: 'resilience',
        name: 'Resiliência',
        description: 'Celebra a persistência em superar obstáculos e manter o foco.',
        icon: '🛡️',
        color: '#EF4444',
        keywords: ['persistência', 'superação', 'foco', 'determinação', 'resistência'],
    },
    {
        id: 'communication',
        name: 'Comunicação Clara',
        description: 'Premia quem compartilha informações e feedbacks de forma objetiva.',
        icon: '🗣️',
        color: '#F97316',
        keywords: ['comunicação', 'feedback', 'clareza', 'explicação', 'transparência'],
    },
    {
        id: 'commitment',
        name: 'Comprometimento',
        description: 'Destaque para quem mantém entregas consistentes e responsabilidade com o time.',
        icon: '📌',
        color: '#0EA5E9',
        keywords: ['responsabilidade', 'entrega', 'consistência', 'compromisso', 'pontualidade'],
    },
]

export const BADGE_MAP = BADGES.reduce<Record<string, BadgeDefinition>>((acc, badge) => {
    acc[badge.id] = badge
    return acc
}, {})


