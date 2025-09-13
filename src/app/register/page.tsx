'use client'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, User, Building, GraduationCap } from 'lucide-react';

type UserType = 'aluno' | 'recrutador' | 'gestor';

interface FormData {
    userType: UserType;
    nome: string;
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

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const [formData, setFormData] = useState<FormData>({
        userType: 'aluno',
        nome: '',
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

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isEmailValid, setIsEmailValid] = useState(false);

    const nomeRef = useRef<HTMLInputElement>(null);

    // Auto-focus no primeiro campo
    useEffect(() => {
        if (nomeRef.current) {
            nomeRef.current.focus();
        }
    }, []);

    // Validação de email em tempo real
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const valid = emailRegex.test(formData.email);
                setIsEmailValid(valid);
                setErrors(prev => ({
                    ...prev,
                    email: valid ? '' : 'Por favor, insira um email válido'
                }));
            } else {
                setIsEmailValid(false);
                setErrors(prev => ({ ...prev, email: '' }));
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.email]);

    // Validação de senha
    useEffect(() => {
        if (formData.password) {
            if (formData.password.length < 6) {
                setErrors(prev => ({
                    ...prev,
                    password: 'A senha deve ter pelo menos 6 caracteres'
                }));
            } else {
                setErrors(prev => ({ ...prev, password: '' }));
            }
        } else {
            setErrors(prev => ({ ...prev, password: '' }));
        }

        // Validação de confirmação de senha
        if (formData.confirmPassword) {
            if (formData.password !== formData.confirmPassword) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: 'As senhas não coincidem'
                }));
            } else {
                setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
        }
    }, [formData.password, formData.confirmPassword]);

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

    const handleInputChange = (field: keyof FormData, value: string) => {
        let formattedValue = value;

        if (field === 'cpf') {
            formattedValue = formatCPF(value);
        } else if (field === 'cnpj') {
            formattedValue = formatCNPJ(value);
        } else if (field === 'telefone') {
            formattedValue = formatPhone(value);
        } else if (field === 'cep') {
            formattedValue = formatCEP(value);
        }

        setFormData(prev => ({
            ...prev,
            [field]: formattedValue
        }));
    };

    const handleUserTypeChange = (type: UserType) => {
        setFormData(prev => ({
            ...prev,
            userType: type,
            // Limpar campos específicos quando mudar de tipo
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
    };

    const validateStep1 = () => {
        const newErrors: Partial<FormData> = {};

        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!isEmailValid) newErrors.email = 'Email inválido';
        if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Partial<FormData> = {};

        // CPF é sempre obrigatório
        if (!formData.cpf || formData.cpf.length < 14) {
            newErrors.cpf = 'CPF é obrigatório e deve estar completo';
        }

        // Telefone obrigatório
        if (!formData.telefone || formData.telefone.length < 14) {
            newErrors.telefone = 'Telefone é obrigatório';
        }

        // Endereço obrigatório
        if (!formData.endereco.trim()) {
            newErrors.endereco = 'Endereço é obrigatório';
        }

        // Cidade obrigatória
        if (!formData.cidade.trim()) {
            newErrors.cidade = 'Cidade é obrigatória';
        }

        // Estado obrigatório
        if (!formData.estado.trim()) {
            newErrors.estado = 'Estado é obrigatório';
        }

        // CEP obrigatório
        if (!formData.cep || formData.cep.length < 9) {
            newErrors.cep = 'CEP é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: Partial<FormData> = {};

        switch (formData.userType) {
            case 'aluno':
                if (!formData.curso?.trim()) {
                    newErrors.curso = 'Curso é obrigatório';
                }
                if (!formData.universidade?.trim()) {
                    newErrors.universidade = 'Universidade é obrigatória';
                }
                if (!formData.periodo?.trim()) {
                    newErrors.periodo = 'Período é obrigatório';
                }
                break;

            case 'recrutador':
                if (!formData.nomeEmpresa?.trim()) {
                    newErrors.nomeEmpresa = 'Nome da empresa é obrigatório';
                }
                if (!formData.cargo?.trim()) {
                    newErrors.cargo = 'Cargo é obrigatório';
                }
                if (!formData.setor?.trim()) {
                    newErrors.setor = 'Setor é obrigatório';
                }
                break;

            case 'gestor':
                if (!formData.nomeUniversidade?.trim()) {
                    newErrors.nomeUniversidade = 'Nome da universidade é obrigatório';
                }
                if (!formData.departamento?.trim()) {
                    newErrors.departamento = 'Departamento é obrigatório';
                }
                if (!formData.cargoGestor?.trim()) {
                    newErrors.cargoGestor = 'Cargo é obrigatório';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar etapa 3 antes de enviar
        if (!validateStep3()) {
            showToastMessage('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        setLoading(true);

        try {
            console.log('Dados do registro:', formData);
            await new Promise(resolve => setTimeout(resolve, 2000));
            showToastMessage('Conta criada com sucesso!', 'success');
        } catch (error) {
            showToastMessage('Erro ao criar conta. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const userTypeConfig = {
        aluno: {
            icon: User,
            title: 'Aluno',
            description: 'Buscar oportunidades de estágio e emprego',
            color: 'from-blue-600 to-blue-700'
        },
        recrutador: {
            icon: Building,
            title: 'Recrutador',
            description: 'Encontrar talentos para sua empresa',
            color: 'from-green-600 to-green-700'
        },
        gestor: {
            icon: GraduationCap,
            title: 'Gestor Universitário',
            description: 'Gerenciar parcerias e oportunidades',
            color: 'from-purple-600 to-purple-700'
        }
    };

    const renderSpecificFields = () => {
        switch (formData.userType) {
            case 'aluno':
                return (
                    <>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Curso</label>
                            <input
                                type="text"
                                value={formData.curso || ''}
                                onChange={(e) => handleInputChange('curso', e.target.value)}
                                placeholder="Seu curso"
                                className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.curso ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.curso && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.curso}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Universidade</label>
                            <input
                                type="text"
                                value={formData.universidade || ''}
                                onChange={(e) => handleInputChange('universidade', e.target.value)}
                                placeholder="Sua universidade"
                                className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.universidade ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.universidade && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.universidade}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Período</label>
                            <select
                                value={formData.periodo || ''}
                                onChange={(e) => handleInputChange('periodo', e.target.value)}
                                className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.periodo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                            >
                                <option value="">Selecione o período</option>
                                <option value="1">1º Período</option>
                                <option value="2">2º Período</option>
                                <option value="3">3º Período</option>
                                <option value="4">4º Período</option>
                                <option value="5">5º Período</option>
                                <option value="6">6º Período</option>
                                <option value="7">7º Período</option>
                                <option value="8">8º Período</option>
                                <option value="9">9º Período</option>
                                <option value="10">10º Período</option>
                            </select>
                            {errors.periodo && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.periodo}
                                </p>
                            )}
                        </div>
                    </>
                );
            case 'recrutador':
                return (
                    <>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Nome da Empresa</label>
                            <input
                                type="text"
                                value={formData.nomeEmpresa || ''}
                                onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                                placeholder="Nome da empresa"
                                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Cargo</label>
                            <input
                                type="text"
                                value={formData.cargo || ''}
                                onChange={(e) => handleInputChange('cargo', e.target.value)}
                                placeholder="Seu cargo na empresa"
                                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Setor</label>
                            <select
                                value={formData.setor || ''}
                                onChange={(e) => handleInputChange('setor', e.target.value)}
                                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                            >
                                <option value="">Selecione o setor</option>
                                <option value="tecnologia">Tecnologia</option>
                                <option value="financeiro">Financeiro</option>
                                <option value="saude">Saúde</option>
                                <option value="educacao">Educação</option>
                                <option value="varejo">Varejo</option>
                                <option value="industria">Indústria</option>
                                <option value="servicos">Serviços</option>
                                <option value="outros">Outros</option>
                            </select>
                        </div>
                    </>
                );
            case 'gestor':
                return (
                    <>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Nome da Universidade</label>
                            <input
                                type="text"
                                value={formData.nomeUniversidade || ''}
                                onChange={(e) => handleInputChange('nomeUniversidade', e.target.value)}
                                placeholder="Nome da universidade"
                                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Departamento</label>
                            <input
                                type="text"
                                value={formData.departamento || ''}
                                onChange={(e) => handleInputChange('departamento', e.target.value)}
                                placeholder="Departamento ou área"
                                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label className="text-gray-700 font-semibold">Cargo</label>
                            <input
                                type="text"
                                value={formData.cargoGestor || ''}
                                onChange={(e) => handleInputChange('cargoGestor', e.target.value)}
                                placeholder="Seu cargo na universidade"
                                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                            />
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            {/* Toast Notification */}
            <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}>
                <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toastType === 'success' ?
                        <CheckCircle className="h-5 w-5" /> :
                        <XCircle className="h-5 w-5" />
                    }
                    {toastMessage}
                </div>
            </div>

            <div className="max-w-7xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 md:p-10 lg:p-12">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-6">
                        <div>
                            <Image
                                src="/logo.png"
                                alt="Needuk"
                                width={120}
                                height={120}
                                className="w-24 h-24 md:w-44 md:h-32 object-contain transition-transform duration-300 hover:scale-105"
                                priority
                            />
                        </div>
                    </div>

                    {/* Título Principal */}
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            Crie sua conta
                        </span>
                    </h1>

                    <p className="text-gray-600 text-center mb-6">
                        Escolha o tipo de conta e preencha seus dados
                    </p>

                    {/* Seleção de Tipo de Usuário */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {(Object.keys(userTypeConfig) as UserType[]).map((type) => {
                            const config = userTypeConfig[type];
                            const Icon = config.icon;
                            const isSelected = formData.userType === type;

                            return (
                                <button
                                    key={type}
                                    onClick={() => handleUserTypeChange(type)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${isSelected
                                        ? `border-transparent bg-gradient-to-r ${config.color} text-white shadow-lg`
                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                        }`}
                                >
                                    <Icon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                                    <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                        {config.title}
                                    </h3>
                                    <p className={`text-sm ${isSelected ? 'text-white opacity-90' : 'text-gray-600'}`}>
                                        {config.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Indicador de Progresso */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${currentStep >= step
                                        ? `bg-gradient-to-r ${userTypeConfig[formData.userType].color} text-white`
                                        : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {step}
                                    </div>
                                    {step < 3 && (
                                        <div className={`w-8 h-1 transition-all duration-300 ${currentStep > step ? `bg-gradient-to-r ${userTypeConfig[formData.userType].color}` : 'bg-gray-300'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
                        {/* Etapa 1: Dados Básicos */}
                        {currentStep === 1 && (
                            <>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados Básicos</h2>

                                {/* Nome */}
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <label className="text-gray-700 font-semibold">Nome Completo</label>
                                    <input
                                        ref={nomeRef}
                                        type="text"
                                        value={formData.nome}
                                        onChange={(e) => handleInputChange('nome', e.target.value)}
                                        placeholder="Seu nome completo"
                                        className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.nome ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                                            }`}
                                    />
                                    {errors.nome && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.nome}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <label className="text-gray-700 font-semibold">Email</label>
                                    <div className="relative w-full">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="seu@email.com"
                                            className={`w-full text-black px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.email
                                                ? 'border-red-500 focus:ring-red-500'
                                                : isEmailValid && formData.email
                                                    ? 'border-green-500 focus:ring-green-500'
                                                    : 'border-gray-300 focus:ring-purple-500'
                                                }`}
                                        />
                                        {formData.email && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                {isEmailValid ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Senha */}
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <label className="text-gray-700 font-semibold">Senha</label>
                                    <div className="relative w-full">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            placeholder="••••••••"
                                            className={`w-full text-black px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-all duration-200"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    {/* Indicador de força da senha */}
                                    {formData.password && (
                                        <div className="w-full">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Força da senha:</span>
                                                <span className={`font-medium ${passwordStrength >= 4 ? 'text-green-600' :
                                                    passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {strengthTexts[passwordStrength - 1] || 'Muito fraca'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${strengthColors[passwordStrength - 1] || 'bg-gray-300'
                                                        }`}
                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {errors.password && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirmar Senha */}
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <label className="text-gray-700 font-semibold">Confirmar Senha</label>
                                    <div className="relative w-full">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                            placeholder="••••••••"
                                            className={`w-full text-black px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-all duration-200"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className={`w-[200px] py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r ${userTypeConfig[formData.userType].color} text-white hover:opacity-90`}
                                >
                                    Próximo
                                </button>
                            </>
                        )}

                        {/* Etapa 2: Documentos */}
                        {currentStep === 2 && (
                            <>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Documentos e Contato</h2>

                                {/* CPF (sempre visível) */}
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <label className="text-gray-700 font-semibold">CPF</label>
                                    <input
                                        type="text"
                                        value={formData.cpf}
                                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                        className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.cpf ? 'border-red-500 focus:ring-red-500' : `border-gray-300 focus:ring-${formData.userType === 'aluno' ? 'blue' : formData.userType === 'recrutador' ? 'green' : 'purple'}-500`
                                            }`}
                                    />
                                    {errors.cpf && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.cpf}
                                        </p>
                                    )}
                                </div>

                                {/* CNPJ (apenas para recrutador e gestor) */}
                                {formData.userType !== 'aluno' && (
                                    <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                        <label className="text-gray-700 font-semibold">CNPJ (opcional)</label>
                                        <input
                                            type="text"
                                            value={formData.cnpj}
                                            onChange={(e) => handleInputChange('cnpj', e.target.value)}
                                            placeholder="00.000.000/0000-00"
                                            maxLength={18}
                                            className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-${formData.userType === 'recrutador' ? 'green' : 'purple'}-500`}
                                        />
                                    </div>
                                )}

                                {/* Telefone */}
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <label className="text-gray-700 font-semibold">Telefone</label>
                                    <input
                                        type="text"
                                        value={formData.telefone}
                                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                        className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.telefone ? 'border-red-500 focus:ring-red-500' : `border-gray-300 focus:ring-${formData.userType === 'aluno' ? 'blue' : formData.userType === 'recrutador' ? 'green' : 'purple'}-500`
                                            }`}
                                    />
                                    {errors.telefone && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.telefone}
                                        </p>
                                    )}
                                </div>

                                {/* Endereço */}
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <label className="text-gray-700 font-semibold">Endereço</label>
                                    <input
                                        type="text"
                                        value={formData.endereco}
                                        onChange={(e) => handleInputChange('endereco', e.target.value)}
                                        placeholder="Rua, número, bairro"
                                        className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.endereco ? 'border-red-500 focus:ring-red-500' : `border-gray-300 focus:ring-${formData.userType === 'aluno' ? 'blue' : formData.userType === 'recrutador' ? 'green' : 'purple'}-500`
                                            }`}
                                    />
                                    {errors.endereco && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.endereco}
                                        </p>
                                    )}
                                </div>

                                {/* Cidade e Estado */}
                                <div className="flex gap-4 w-full max-w-md">
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <label className="text-gray-700 font-semibold">Cidade</label>
                                        <input
                                            type="text"
                                            value={formData.cidade}
                                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                                            placeholder="Sua cidade"
                                            className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.cidade ? 'border-red-500 focus:ring-red-500' : `border-gray-300 focus:ring-${formData.userType === 'aluno' ? 'blue' : formData.userType === 'recrutador' ? 'green' : 'purple'}-500`
                                                }`}
                                        />
                                        {errors.cidade && (
                                            <p className="text-red-500 text-xs flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.cidade}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <label className="text-gray-700 font-semibold">Estado</label>
                                        <input
                                            type="text"
                                            value={formData.estado}
                                            onChange={(e) => handleInputChange('estado', e.target.value)}
                                            placeholder="UF"
                                            maxLength={2}
                                            className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.estado ? 'border-red-500 focus:ring-red-500' : `border-gray-300 focus:ring-${formData.userType === 'aluno' ? 'blue' : formData.userType === 'recrutador' ? 'green' : 'purple'}-500`
                                                }`}
                                        />
                                        {errors.estado && (
                                            <p className="text-red-500 text-xs flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.estado}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* CEP */}
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <label className="text-gray-700 font-semibold">CEP</label>
                                    <input
                                        type="text"
                                        value={formData.cep}
                                        onChange={(e) => handleInputChange('cep', e.target.value)}
                                        placeholder="00000-000"
                                        maxLength={9}
                                        className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.cep ? 'border-red-500 focus:ring-red-500' : `border-gray-300 focus:ring-${formData.userType === 'aluno' ? 'blue' : formData.userType === 'recrutador' ? 'green' : 'purple'}-500`
                                            }`}
                                    />
                                    {errors.cep && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.cep}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="w-[120px] py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:scale-105"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className={`w-[200px] py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r ${userTypeConfig[formData.userType].color} text-white hover:opacity-90`}
                                    >
                                        Próximo
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Etapa 3: Informações Específicas */}
                        {currentStep === 3 && (
                            <>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Informações de {userTypeConfig[formData.userType].title}
                                </h2>

                                {renderSpecificFields()}

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="w-[120px] py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:scale-105"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-[200px] py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r ${userTypeConfig[formData.userType].color} text-white hover:opacity-90`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Criando...
                                            </span>
                                        ) : (
                                            'Criar Conta'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>

                    {/* Link para login */}
                    <div className="mt-8">
                        <p className="text-center text-gray-600">
                            Já tem uma conta?{' '}
                            <Link
                                href="/login"
                                className="text-purple-600 hover:text-purple-700 font-semibold transition-all duration-200 hover:scale-105 inline-block"
                            >
                                Faça login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}