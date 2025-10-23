import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { authClient } from '@/lib/auth-client';
import { useForm, useApi } from '@/hooks/custom';
import { useUniversities, useCourses } from '@/hooks/custom/useAutocomplete';
import { useCep, type CepData } from '@/hooks/custom/useCep';
import { commonSchemas, validationUtils } from '@/utils/validation-helpers';
import { allCourses } from '@/constants/courses';
import { showSuccess, showError } from '@/components/ui';

export type UserType = 'aluno' | 'recrutador' | 'gestor';

// Usar funções de validação centralizadas
const { isValidCPF, isValidCNPJ, isValidPhone } = validationUtils;

// Schema base comum (sem refinements)
const baseFields = {
    userType: z.enum(['aluno', 'recrutador', 'gestor']),
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .refine((name) => name.trim().split(' ').length >= 2, 'Digite seu nome completo (nome e sobrenome)'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
    telefone: z.string()
        .min(14, 'Telefone é obrigatório')
        .refine((telefone) => {
            // Remove formatação para validar
            const cleaned = telefone.replace(/\D/g, '');
            return cleaned.length === 10 || cleaned.length === 11; // Telefones: 10 dígitos (fixo) ou 11 dígitos (celular)
        }, 'Telefone deve ter 10 ou 11 dígitos')
        .refine(isValidPhone, 'Telefone inválido'),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres').regex(/^[A-Z]{2}$/, 'Estado deve conter apenas letras maiúsculas'),
    cep: z.string().min(9, 'CEP é obrigatório').regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
};

// Schema específico para aluno
const alunoSchema = z.object({
    ...baseFields,
    cpf: z.string()
        .min(14, 'CPF é obrigatório')
        .refine(isValidCPF, 'CPF inválido'),
    curso: z.string()
        .min(1, 'Curso é obrigatório')
        .refine((curso) => {
            // Verificar se o curso digitado existe na lista de cursos disponíveis
            return allCourses.some(course =>
                course.toLowerCase() === curso.toLowerCase().trim()
            );
        }, 'Selecione um curso válido da lista de sugestões'),
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
        return isValidCPF(data.cpf);
    }
    // Validar CNPJ se preenchido
    if (data.cnpj && data.cnpj.length === 18) {
        return isValidCNPJ(data.cnpj);
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
        return isValidCPF(data.cpf);
    }
    // Validar CNPJ se preenchido
    if (data.cnpj && data.cnpj.length === 18) {
        return isValidCNPJ(data.cnpj);
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
    const [currentStep, setCurrentStep] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showPlansPopup, setShowPlansPopup] = useState(false);
    const [selectedPlanLoading, setSelectedPlanLoading] = useState<PlanType | null>(null);

    // Hook para busca de CEP
    const cepHook = useCep();

    // Hooks para autocomplete
    const universitiesHook = useUniversities();
    const coursesHook = useCourses();

    // Hook para signup
    const signupApi = useApi({
        onSuccess: (data) => {
            showToastMessage('Conta criada com sucesso! Redirecionando...', 'success');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        },
        onError: (error) => {
            // Tratar erros específicos
            if (error.includes('CPF já cadastrado') ||
                error.includes('CPF já existe') ||
                error.includes('CPF already registered')) {
                showToastMessage('Este CPF já pertence a um usuário.', 'error');
            } else if (error.includes('EMAIL_ALREADY_EXISTS') ||
                error.includes('Email already exists') ||
                error.includes('email already registered') ||
                error.includes('already exists')) {
                showToastMessage('Este email já pertence a um usuário. Tente fazer login.', 'error');
            } else if (error.includes('INVALID_EMAIL') ||
                       error.includes('Invalid email')) {
                showToastMessage('Email inválido. Verifique e tente novamente.', 'error');
            } else if (error.includes('WEAK_PASSWORD') ||
                       error.includes('Password is too weak')) {
                showToastMessage('Senha muito fraca. Use pelo menos 8 caracteres.', 'error');
            } else {
                showToastMessage(error || 'Erro ao criar conta. Tente novamente.', 'error');
            }
        }
    });

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
        // Campos específicos de aluno
        curso: '',
        universidade: '',
        periodo: '',
        // Campos específicos de recrutador
        nomeEmpresa: '',
        cargo: '',
        setor: '',
        // Campos específicos de gestor
        nomeUniversidade: '',
        departamento: '',
        cargoGestor: '',
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

            // Buscar endereço automaticamente quando CEP estiver completo
            const cleanCep = formattedValue.replace(/\D/g, '');
            if (cleanCep.length === 8 && cleanCep !== formData.cep.replace(/\D/g, '')) {
                cepHook.searchCep(cleanCep).then((cepData: CepData | null) => {
                    if (cepData) {
                        setFormData(prev => ({
                            ...prev,
                            // Só preenche o endereço se estiver vazio (permite que o usuário mantenha o que digitou)
                            endereco: formData.endereco || `${cepData.logradouro}${cepData.complemento ? `, ${cepData.complemento}` : ''}`,
                            cidade: cepData.localidade,
                            estado: cepData.uf,
                            cep: formattedValue
                        }));
                    }
                });
            }
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
                    name: z.string()
                        .min(1, 'Nome é obrigatório')
                        .min(2, 'Nome deve ter pelo menos 2 caracteres')
                        .refine((name) => name.trim().split(' ').length >= 2, 'Digite seu nome completo (nome e sobrenome)'),
                    email: z.string()
                        .min(1, 'Email é obrigatório')
                        .email('Email inválido'),
                    password: z.string()
                        .min(1, 'Senha é obrigatória')
                        .min(8, 'Senha deve ter pelo menos 8 caracteres'),
                    confirmPassword: z.string()
                        .min(1, 'Confirmação de senha é obrigatória'),
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
                        cpf: z.string().min(14, 'CPF é obrigatório').refine(isValidCPF, 'CPF inválido'),
                        telefone: z.string()
        .min(14, 'Telefone é obrigatório')
        .refine((telefone) => {
            // Remove formatação para validar
            const cleaned = telefone.replace(/\D/g, '');
            return cleaned.length === 10 || cleaned.length === 11; // Telefones: 10 dígitos (fixo) ou 11 dígitos (celular)
        }, 'Telefone deve ter 10 ou 11 dígitos')
        .refine(isValidPhone, 'Telefone inválido'),
                        endereco: z.string().min(1, 'Endereço é obrigatório'),
                        cidade: z.string().min(1, 'Cidade é obrigatória'),
                        estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres').regex(/^[A-Z]{2}$/, 'Estado deve conter apenas letras maiúsculas'),
                        cep: z.string().min(9, 'CEP é obrigatório').regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
                    })
                    : z.object({
                        cpf: z.string().optional(),
                        cnpj: z.string().optional(),
                        telefone: z.string()
        .min(14, 'Telefone é obrigatório')
        .refine((telefone) => {
            // Remove formatação para validar
            const cleaned = telefone.replace(/\D/g, '');
            return cleaned.length === 10 || cleaned.length === 11; // Telefones: 10 dígitos (fixo) ou 11 dígitos (celular)
        }, 'Telefone deve ter 10 ou 11 dígitos')
        .refine(isValidPhone, 'Telefone inválido'),
                        endereco: z.string().min(1, 'Endereço é obrigatório'),
                        cidade: z.string().min(1, 'Cidade é obrigatória'),
                        estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres').regex(/^[A-Z]{2}$/, 'Estado deve conter apenas letras maiúsculas'),
                        cep: z.string().min(9, 'CEP é obrigatório').regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
                    }).refine((data) => {
                        return (data.cpf && data.cpf.length === 14) || (data.cnpj && data.cnpj.length === 18);
                    }, {
                        message: "CPF ou CNPJ é obrigatório",
                        path: ["cpf"],
                    }).refine((data) => {
                        // Validar CPF se preenchido
                        if (data.cpf && data.cpf.length === 14) {
                            return isValidCPF(data.cpf);
                        }
                        // Validar CNPJ se preenchido
                        if (data.cnpj && data.cnpj.length === 18) {
                            return isValidCNPJ(data.cnpj);
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
            try {
                await createAccount('free');
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Erro ao criar conta.';
                showToastMessage(message, 'error');
            }
            return;
        }

        // Para alunos, mostrar popup de planos
        setShowPlansPopup(true);
    };

    const createAccount = async (plan: PlanType) => {
        // Validar unicidade do CPF se fornecido (apenas para CPF, não CNPJ)
        if (formData.cpf && formData.cpf.length === 14) {
            try {
                const cpfValidationResponse = await fetch('/api/validate-cpf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ cpf: formData.cpf }),
                });

                const cpfValidationResult = await cpfValidationResponse.json();

                if (!cpfValidationResponse.ok) {
                    const message = cpfValidationResult?.error || cpfValidationResult?.message || 'CPF já cadastrado no sistema';
                    throw new Error(message);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Erro ao validar CPF';
                throw new Error(message);
            }
        }

        const success = await signupApi.execute(async () => {
            const result = await authClient.signUp.email({
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
            });

            // Verificar se houve erro na criação da conta
            if (result?.error) {
                throw new Error(result.error.message || 'Erro ao criar conta');
            }

            // Verificar se a criação foi bem-sucedida
            if (!result?.data) {
                throw new Error('Erro ao criar conta');
            }

            return result;
        });

        if (success) {
            // O callback onSuccess do signupApi já trata o sucesso
        }
    };

    const handlePlanSelection = async (selectedPlan: PlanType) => {
        setFormData(prev => ({ ...prev, plan: selectedPlan }));
        setSelectedPlanLoading(selectedPlan);

        try {
            await createAccount(selectedPlan);
            setShowPlansPopup(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.';
            showToastMessage(message, 'error');
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
        loading: signupApi.loading,
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
        cepHook,
        universitiesHook,
        coursesHook,

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
