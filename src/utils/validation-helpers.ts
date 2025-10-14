import { z } from 'zod';

/**
 * Validações comuns reutilizáveis
 */
export const validationHelpers = {
    // Campos obrigatórios
    required: (fieldName: string) =>
        z.string().min(1, `${fieldName} é obrigatório`),

    // Email com normalização
    email: z.string()
        .min(1, 'Email é obrigatório')
        .email('Email inválido')
        .transform((email) => email.toLowerCase().trim()),

    // Senha
    password: z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
               'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),

    // Confirmação de senha
    passwordConfirm: z.string().min(1, 'Confirmação de senha é obrigatória'),

    // Nome
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),

    // Telefone brasileiro
    phone: z.string()
        .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX'),

    // CPF
    cpf: z.string()
        .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato XXX.XXX.XXX-XX'),

    // Data futura
    futureDate: z.string()
        .refine((date) => {
            const selectedDate = new Date(date);
            const now = new Date();
            return selectedDate > now;
        }, 'Data deve ser no futuro'),

    // Data passada
    pastDate: z.string()
        .refine((date) => {
            const selectedDate = new Date(date);
            const now = new Date();
            return selectedDate < now;
        }, 'Data deve ser no passado'),

    // URL
    url: z.string()
        .url('URL inválida')
        .optional()
        .or(z.literal('')),

    // Número positivo
    positiveNumber: (fieldName: string) =>
        z.number()
            .positive(`${fieldName} deve ser um número positivo`)
            .or(z.string().regex(/^\d+(\.\d+)?$/))
            .transform((val) => typeof val === 'string' ? parseFloat(val) : val),

    // Lista de emails
    emailList: z.array(z.string().email().transform(email => email.toLowerCase().trim()))
        .min(1, 'Pelo menos um email é obrigatório')
        .max(50, 'Máximo de 50 emails'),

    // Texto com limite
    text: (maxLength: number, fieldName: string) =>
        z.string()
            .max(maxLength, `${fieldName} deve ter no máximo ${maxLength} caracteres`)
            .optional()
            .or(z.literal('')),
};

/**
 * Funções utilitárias para validação
 */
export const validationUtils = {
    // Validar CPF
    isValidCPF: (cpf: string): boolean => {
        const cleanedCPF = cpf.replace(/\D/g, '');

        if (cleanedCPF.length !== 11) return false;
        if (/^(\d)\1+$/.test(cleanedCPF)) return false; // CPF com todos dígitos iguais

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanedCPF[i]) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10) remainder = 0;
        if (remainder !== parseInt(cleanedCPF[9])) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanedCPF[i]) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10) remainder = 0;

        return remainder === parseInt(cleanedCPF[10]);
    },

    // Validar CNPJ
    isValidCNPJ: (cnpj: string): boolean => {
        const cleanedCNPJ = cnpj.replace(/\D/g, '');
        if (cleanedCNPJ.length !== 14) return false;
        if (/^(\d)\1+$/.test(cleanedCNPJ)) return false; // CNPJ com todos dígitos iguais

        // Validação do CNPJ
        let size = cleanedCNPJ.length - 2;
        let numbers = cleanedCNPJ.substring(0, size);
        let digits = cleanedCNPJ.substring(size);
        let sum = 0;
        let pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;

        size = size + 1;
        numbers = cleanedCNPJ.substring(0, size);
        sum = 0;
        pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        return result === parseInt(digits.charAt(1));
    },

    // Formatar CPF
    formatCPF: (cpf: string): string => {
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length !== 11) return cpf;
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    },

    // Validar telefone
    isValidPhone: (phone: string): boolean => {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length === 10 || cleaned.length === 11; // Fixo ou celular
    },

    // Formatar telefone
    formatPhone: (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return phone;
    },

    // Normalizar email
    normalizeEmail: (email: string): string => {
        return email.toLowerCase().trim();
    },

    // Validar força da senha
    getPasswordStrength: (password: string): 'weak' | 'medium' | 'strong' => {
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLong = password.length >= 8;

        const score = [hasLower, hasUpper, hasNumber, hasSpecial, isLong].filter(Boolean).length;

        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    },

    // Sanitizar entrada de texto
    sanitizeText: (text: string): string => {
        return text.trim().replace(/\s+/g, ' ');
    },

    // Validar data
    isValidDate: (dateString: string): boolean => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    },

    // Verificar se data é maior que hoje
    isFutureDate: (dateString: string): boolean => {
        const date = new Date(dateString);
        const now = new Date();
        return date > now;
    },

    // Verificar se data é menor que hoje
    isPastDate: (dateString: string): boolean => {
        const date = new Date(dateString);
        const now = new Date();
        return date < now;
    },
};

/**
 * Esquemas Zod comuns reutilizáveis
 */
export const commonSchemas = {
    // Login
    login: z.object({
        email: validationHelpers.email,
        password: z.string().min(1, 'Senha é obrigatória'),
    }),

    // Login simples (sem validação rigorosa de senha)
    loginSimple: z.object({
        email: z.string()
            .min(1, 'Email é obrigatório')
            .email('Email inválido')
            .transform((email) => email.toLowerCase().trim()),
        password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    }),

    // Cadastro
    signup: z.object({
        name: validationHelpers.name,
        email: validationHelpers.email,
        password: validationHelpers.password,
        passwordConfirm: validationHelpers.passwordConfirm,
    }).refine((data) => data.password === data.passwordConfirm, {
        message: "Senhas não coincidem",
        path: ["passwordConfirm"],
    }),

    // Perfil
    profile: z.object({
        name: validationHelpers.name,
        email: validationHelpers.email,
        phone: validationHelpers.phone.optional(),
    }),

    // Atividade
    activity: z.object({
        title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
        description: validationHelpers.text(1000, 'Descrição'),
        startDate: validationHelpers.futureDate,
        endDate: z.string().optional(),
        participantEmails: validationHelpers.emailList,
        links: z.array(z.object({
            title: z.string().min(1, 'Título do link é obrigatório'),
            url: validationHelpers.url,
        })).optional(),
    }),

    // Convite
    invite: z.object({
        emails: validationHelpers.emailList,
        activityTitle: z.string().min(1, 'Título da atividade é obrigatório'),
    }),
};
