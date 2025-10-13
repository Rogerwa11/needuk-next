import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { authClient } from '@/lib/auth-client';

export type UserType = 'aluno' | 'recrutador' | 'gestor';

// Schema base comum (sem refinements)
const baseFields = {
    userType: z.enum(['aluno', 'recrutador', 'gestor']),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
    telefone: z.string().min(14, 'Telefone é obrigatório'),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    cep: z.string().min(9, 'CEP é obrigatório'),
};

// Função auxiliar para validar CPF
const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCPF.charAt(9)) !== firstDigit) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let secondDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleanCPF.charAt(10)) === secondDigit;
};

// Função auxiliar para validar CNPJ
const validateCNPJ = (cnpj: string) => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    let firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCNPJ.charAt(12)) !== firstDigit) return false;

    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    let secondDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleanCNPJ.charAt(13)) === secondDigit;
};

// Schema específico para aluno
const alunoSchema = z.object({
    ...baseFields,
    cpf: z.string()
        .min(14, 'CPF é obrigatório')
        .refine(validateCPF, 'CPF inválido'),
    curso: z.string().min(1, 'Curso é obrigatório'),
    universidade: z.string().min(1, 'Universidade é obrigatória'),
    periodo: z.string().min(1, 'Período é obrigatório'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

// Schema específico para recrutador
const recrutadorSchema = z.object({
    ...baseFields,
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    nomeEmpresa: z.string().min(1, 'Nome da empresa é obrigatório'),
    cargo: z.string().min(1, 'Cargo é obrigatório'),
    setor: z.string().min(1, 'Setor é obrigatório'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
}).refine((data) => {
    const hasCpf = data.cpf && data.cpf.length === 14; // CPF formatado tem 14 caracteres
    const hasCnpj = data.cnpj && data.cnpj.length === 18; // CNPJ formatado tem 18 caracteres
    return hasCpf || hasCnpj;
}, {
    message: "CPF ou CNPJ é obrigatório",
    path: ["cpf"],
}).refine((data) => {
    // Validar CPF se preenchido
    if (data.cpf && data.cpf.length === 14) {
        return validateCPF(data.cpf);
    }
    // Validar CNPJ se preenchido
    if (data.cnpj && data.cnpj.length === 18) {
        return validateCNPJ(data.cnpj);
    }
    return true;
}, {
    message: "Documento inválido",
    path: ["cpf"],
});

// Schema específico para gestor
const gestorSchema = z.object({
    ...baseFields,
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    nomeUniversidade: z.string().min(1, 'Nome da universidade é obrigatório'),
    departamento: z.string().min(1, 'Departamento é obrigatório'),
    cargoGestor: z.string().min(1, 'Cargo é obrigatório'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
}).refine((data) => {
    const hasCpf = data.cpf && data.cpf.length === 14; // CPF formatado tem 14 caracteres
    const hasCnpj = data.cnpj && data.cnpj.length === 18; // CNPJ formatado tem 18 caracteres
    return hasCpf || hasCnpj;
}, {
    message: "CPF ou CNPJ é obrigatório",
    path: ["cpf"],
}).refine((data) => {
    // Validar CPF se preenchido
    if (data.cpf && data.cpf.length === 14) {
        return validateCPF(data.cpf);
    }
    // Validar CNPJ se preenchido
    if (data.cnpj && data.cnpj.length === 18) {
        return validateCNPJ(data.cnpj);
    }
    return true;
}, {
    message: "Documento inválido",
    path: ["cpf"],
});

export type PlanType = 'free' | 'plus' | 'premium' | 'pro';

export interface FormData {
    userType: UserType;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    cpf: string;
    cnpj: string;
    telefone: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    plan?: PlanType; // Plano selecionado
    // Campos específicos por tipo
    curso?: string; // Aluno
    universidade?: string; // Aluno
    periodo?: string; // Aluno
    nomeEmpresa?: string; // Recrutador
    cargo?: string; // Recrutador
    setor?: string; // Recrutador
    nomeUniversidade?: string; // Gestor
    departamento?: string; // Gestor
    cargoGestor?: string; // Gestor
}

export const useSignupForm = () => {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showPlansPopup, setShowPlansPopup] = useState(false);
    const [selectedPlanLoading, setSelectedPlanLoading] = useState<PlanType | null>(null);

    const [formData, setFormData] = useState<FormData>({
        userType: 'aluno',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        cpf: '',
        cnpj: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isEmailValid, setIsEmailValid] = useState(false);

    const nameRef = useRef<HTMLInputElement>(null);

    // Controlar hidratação
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Função para obter o schema correto baseado no tipo de usuário
    const getValidationSchema = (userType: UserType) => {
        switch (userType) {
            case 'aluno':
                return alunoSchema;
            case 'recrutador':
                return recrutadorSchema;
            case 'gestor':
                return gestorSchema;
            default:
                return alunoSchema;
        }
    };

    // Função para mostrar toast
    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    // Calcular força da senha
    const calculatePasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 6) strength++;
        if (pass.length >= 8) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;
        return strength;
    };

    const passwordStrength = calculatePasswordStrength(formData.password);
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const strengthTexts = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Forte'];

    // Formatação de CPF e CNPJ
    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const formatCNPJ = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d{4})/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const formatCEP = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d{3})/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };

    // Função para detectar se é CPF ou CNPJ e formatar adequadamente
    const formatCpfOrCnpj = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');

        if (cleanValue.length <= 11) {
            return formatCPF(value);
        } else if (cleanValue.length <= 14) {
            return formatCNPJ(value);
        } else {
            // Se exceder 14 dígitos, manter apenas os primeiros 14
            return formatCNPJ(value.substring(0, 14));
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        let formattedValue = value;

        if (field === 'cpf') {
            if (formData.userType === 'aluno') {
                formattedValue = formatCPF(value);
            } else {
                const cleanValue = value.replace(/\D/g, '');
                formattedValue = formatCpfOrCnpj(value);

                // Se é CPF (11 dígitos), limpar CNPJ
                if (cleanValue.length <= 11) {
                    setFormData(prev => ({ ...prev, cnpj: '' }));
                }
                // Se é CNPJ (14 dígitos), limpar CPF e mover para CNPJ
                else if (cleanValue.length === 14) {
                    setFormData(prev => ({ ...prev, cnpj: formattedValue, cpf: '' }));
                    return;
                }
            }
        } else if (field === 'cnpj') {
            formattedValue = formatCNPJ(value);
            setFormData(prev => ({ ...prev, cpf: '' }));
        } else if (field === 'telefone') {
            formattedValue = formatPhone(value);
        } else if (field === 'cep') {
            formattedValue = formatCEP(value);
        }

        setFormData(prev => ({
            ...prev,
            [field]: formattedValue
        }));

        // Validação em tempo real para email
        if (field === 'email') {
            // Padronizar email para lowercase
            formattedValue = formattedValue.toLowerCase().trim();

            const emailSchema = z.string().email();
            const result = emailSchema.safeParse(formattedValue);
            setIsEmailValid(result.success);

            if (!result.success && formattedValue) {
                setErrors(prev => ({ ...prev, email: 'Email inválido' }));
            } else {
                setErrors(prev => ({ ...prev, email: '' }));
            }
        }

        // Limpar erro do campo quando o usuário digita
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleUserTypeChange = (type: UserType) => {
        setFormData(prev => ({
            ...prev,
            userType: type,
            cpf: '',
            cnpj: '',
            curso: '',
            universidade: '',
            periodo: '',
            nomeEmpresa: '',
            cargo: '',
            setor: '',
            nomeUniversidade: '',
            departamento: '',
            cargoGestor: ''
        }));
        setCurrentStep(1);
        setErrors({});
    };

    const validateCurrentStep = () => {
        const schema = getValidationSchema(formData.userType);

        try {
            if (currentStep === 1) {
                const step1Schema = z.object({
                    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
                    email: z.string().email('Email inválido'),
                    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
                    confirmPassword: z.string(),
                }).refine((data) => data.password === data.confirmPassword, {
                    message: "As senhas não coincidem",
                    path: ["confirmPassword"],
                });

                step1Schema.parse({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                });

            } else if (currentStep === 2) {
                const step2Data: any = {
                    telefone: formData.telefone,
                    endereco: formData.endereco,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    cep: formData.cep,
                };

                if (formData.userType === 'aluno') {
                    step2Data.cpf = formData.cpf;
                } else {
                    step2Data.cpf = formData.cpf;
                    step2Data.cnpj = formData.cnpj;
                }

                const step2Schema = formData.userType === 'aluno'
                    ? z.object({
                        cpf: z.string().min(14, 'CPF é obrigatório').refine(validateCPF, 'CPF inválido'),
                        telefone: z.string().min(14, 'Telefone é obrigatório'),
                        endereco: z.string().min(1, 'Endereço é obrigatório'),
                        cidade: z.string().min(1, 'Cidade é obrigatória'),
                        estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
                        cep: z.string().min(9, 'CEP é obrigatório'),
                    })
                    : z.object({
                        cpf: z.string().optional(),
                        cnpj: z.string().optional(),
                        telefone: z.string().min(14, 'Telefone é obrigatório'),
                        endereco: z.string().min(1, 'Endereço é obrigatório'),
                        cidade: z.string().min(1, 'Cidade é obrigatória'),
                        estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
                        cep: z.string().min(9, 'CEP é obrigatório'),
                    }).refine((data) => {
                        return (data.cpf && data.cpf.length === 14) || (data.cnpj && data.cnpj.length === 18);
                    }, {
                        message: "CPF ou CNPJ é obrigatório",
                        path: ["cpf"],
                    }).refine((data) => {
                        // Validar CPF se preenchido
                        if (data.cpf && data.cpf.length === 14) {
                            return validateCPF(data.cpf);
                        }
                        // Validar CNPJ se preenchido
                        if (data.cnpj && data.cnpj.length === 18) {
                            return validateCNPJ(data.cnpj);
                        }
                        return true;
                    }, {
                        message: "Documento inválido",
                        path: ["cpf"],
                    });

                step2Schema.parse(step2Data);

            } else if (currentStep === 3) {
                schema.parse(formData);
            }

            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path.length > 0) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCurrentStep()) {
            showToastMessage('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        // Se não for aluno, definir plano como 'free' e criar conta diretamente
        if (formData.userType !== 'aluno') {
            setFormData(prev => ({ ...prev, plan: 'free' }));
            await createAccount('free');
            return;
        }

        // Para alunos, mostrar popup de planos
        setShowPlansPopup(true);
    };

    const createAccount = async (plan: PlanType) => {
        setLoading(true);

        try {

            await authClient.signUp.email({
                email: formData.email,
                name: formData.name,
                password: formData.password,
                callbackURL: '/login',
                // Campos adicionais
                userType: formData.userType,
                cpf: formData.cpf,
                cnpj: formData.cnpj,
                telefone: formData.telefone,
                endereco: formData.endereco,
                cidade: formData.cidade,
                estado: formData.estado,
                cep: formData.cep,
                plan: formData.plan || 'free',
                // Campos específicos por tipo
                ...(formData.userType === 'aluno' && {
                    curso: formData.curso || '',
                    universidade: formData.universidade || '',
                    periodo: formData.periodo || ''
                }),
                ...(formData.userType === 'recrutador' && {
                    nomeEmpresa: formData.nomeEmpresa || '',
                    cargo: formData.cargo || '',
                    setor: formData.setor || ''
                }),
                ...(formData.userType === 'gestor' && {
                    nomeUniversidade: formData.nomeUniversidade || '',
                    departamento: formData.departamento || '',
                    cargoGestor: formData.cargoGestor || ''
                })
            }, {
                //onRequest: () => { },
                onSuccess: (ctx) => {
                    showToastMessage('Conta criada com sucesso!', 'success');
                    router.push('/login');
                },
                onError: (ctx) => {
                    if (ctx.error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
                        showToastMessage(`O Email ${formData.email} já foi cadastrado. Tente outro.`, 'error');
                    } else {
                        showToastMessage('Erro ao criar conta. Tente novamente.', 'error');
                    }
                },
            });
        } catch (error) {
            showToastMessage('Erro ao criar conta. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePlanSelection = async (selectedPlan: PlanType) => {
        setFormData(prev => ({ ...prev, plan: selectedPlan }));
        setSelectedPlanLoading(selectedPlan);

        try {
            await createAccount(selectedPlan);
            setShowPlansPopup(false);
        } catch (error) {
            showToastMessage('Erro ao criar conta. Tente novamente.', 'error');
        } finally {
            setSelectedPlanLoading(null);
        }
    };

    const userTypeConfig = {
        aluno: {
            icon: 'User',
            title: 'Aluno',
            description: 'Buscar oportunidades de estágio e emprego',
            color: 'from-blue-600 to-blue-700'
        },
        recrutador: {
            icon: 'Building',
            title: 'Recrutador',
            description: 'Encontrar talentos para sua empresa',
            color: 'from-green-600 to-green-700'
        },
        gestor: {
            icon: 'GraduationCap',
            title: 'Gestor Universitário',
            description: 'Gerenciar parcerias e oportunidades',
            color: 'from-purple-600 to-purple-700'
        }
    };

    const plansConfig = {
        free: {
            title: 'Free',
            price: 'Grátis',
            description: 'Cadastro de Portfólio\nPortfólio Colaborativo',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-500'
        },
        plus: {
            title: 'Plus',
            price: 'R$ 19,90',
            description: 'Cadastro de Portfólio\nPortfólio Colaborativo\n+ Créditos de IA',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-500'
        },
        premium: {
            title: 'Premium',
            price: 'R$ 39,90',
            description: 'Cadastro de Portfólio\nPortfólio Colaborativo\n+ Créditos de IA à mais',
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-500'
        },
        pro: {
            title: 'Pro',
            price: 'R$ 59,90',
            description: 'Cadastro de Portfólio\nPortfólio Colaborativo\n+ Créditos de IA\n+ Banco de Talentos\n+ Gestão de Indicações',
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-500'
        }
    };

    return {
        // Estados
        isHydrated,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        loading,
        currentStep,
        showToast,
        toastMessage,
        toastType,
        showPlansPopup,
        setShowPlansPopup,
        selectedPlanLoading,
        formData,
        errors,
        isEmailValid,
        nameRef,
        passwordStrength,
        strengthColors,
        strengthTexts,
        userTypeConfig,
        plansConfig,

        // Handlers
        handleInputChange,
        handleUserTypeChange,
        handleSubmit,
        handlePlanSelection,
        nextStep,
        prevStep,
        showToastMessage,
        getValidationSchema,
    };
};
