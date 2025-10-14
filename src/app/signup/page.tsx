'use client'
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, User, Building, GraduationCap, X } from 'lucide-react';
import { useSignupForm, UserType, PlanType } from './_components/signup-form';
import { useAuthRedirect } from '@/hooks/useAuth';
import { AuthLoadingScreen } from '@/app/_components/AuthLoadingScreen';
import { Logo } from '@/app/_components/logo';

export default function SignupPage() {

    const { user: user, loading: authLoading } = useAuthRedirect('/dashboard');

    const {
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
    } = useSignupForm();

    if (authLoading || user) {
        return <AuthLoadingScreen />;
    }

    if (!user && !authLoading) {
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
                                    className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.nomeEmpresa ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                />
                                {errors.nomeEmpresa && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.nomeEmpresa}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                <label className="text-gray-700 font-semibold">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.cargo || ''}
                                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                                    placeholder="Seu cargo na empresa"
                                    className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.cargo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                />
                                {errors.cargo && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.cargo}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                <label className="text-gray-700 font-semibold">Setor</label>
                                <select
                                    value={formData.setor || ''}
                                    onChange={(e) => handleInputChange('setor', e.target.value)}
                                    className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.setor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                        }`}
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
                                {errors.setor && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.setor}
                                    </p>
                                )}
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
                                    className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.nomeUniversidade ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                />
                                {errors.nomeUniversidade && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.nomeUniversidade}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                <label className="text-gray-700 font-semibold">Departamento</label>
                                <input
                                    type="text"
                                    value={formData.departamento || ''}
                                    onChange={(e) => handleInputChange('departamento', e.target.value)}
                                    placeholder="Departamento ou área"
                                    className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.departamento ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                />
                                {errors.departamento && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.departamento}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                <label className="text-gray-700 font-semibold">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.cargoGestor || ''}
                                    onChange={(e) => handleInputChange('cargoGestor', e.target.value)}
                                    placeholder="Seu cargo na universidade"
                                    className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.cargoGestor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                />
                                {errors.cargoGestor && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.cargoGestor}
                                    </p>
                                )}
                            </div>
                        </>
                    );
            }
        };

        // Aguardar hidratação para evitar problemas de SSR
        if (!isHydrated) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando...</p>
                    </div>
                </div>
            );
        }

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
                        <Logo />

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
                                const IconComponent = type === 'aluno' ? User : type === 'recrutador' ? Building : GraduationCap;
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
                                        <IconComponent className={`h-8 w-8 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
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
                                            ref={nameRef}
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Seu nome completo"
                                            className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                                                }`}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.name}
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

                                    {/* CPF/CNPJ baseado no tipo de usuário */}
                                    <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                        <label className="text-gray-700 font-semibold">
                                            {formData.userType === 'aluno' ? 'CPF' : 'CPF ou CNPJ'}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.cpf || formData.cnpj}
                                            onChange={(e) => handleInputChange('cpf', e.target.value)}
                                            placeholder={
                                                formData.userType === 'aluno'
                                                    ? "000.000.000-00"
                                                    : "CPF: 000.000.000-00 ou CNPJ: 00.000.000/0000-00"
                                            }
                                            maxLength={formData.userType === 'aluno' ? 14 : 18}
                                            className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.cpf ? 'border-red-500 focus:ring-red-500' : `border-gray-300 focus:ring-${formData.userType === 'aluno' ? 'blue' : formData.userType === 'recrutador' ? 'green' : 'purple'}-500`
                                                }`}
                                        />
                                        {formData.userType !== 'aluno' && (
                                            <p className="text-xs text-gray-500 text-center">
                                                Digite seu CPF (11 dígitos) ou CNPJ (14 dígitos)
                                            </p>
                                        )}
                                        {errors.cpf && (
                                            <p className="text-red-500 text-sm flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.cpf}
                                            </p>
                                        )}
                                        {errors.cnpj && (
                                            <p className="text-red-500 text-sm flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.cnpj}
                                            </p>
                                        )}
                                    </div>

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

                {/* Popup de Planos */}
                {showPlansPopup && (
                    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-100 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-8">
                                {/* Header do Popup */}
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900">Faça o Upgrade!</h2>
                                        <p className="text-gray-600 mt-2">Escolha o plano ideal para você</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPlansPopup(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Grid de Planos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {(Object.keys(plansConfig) as PlanType[]).map((planKey) => {
                                        const plan = plansConfig[planKey];

                                        return (
                                            <div
                                                key={planKey}
                                                className={`relative rounded-xl p-6 text-white ${plan.bgColor} hover:scale-105 transition-all duration-300 cursor-pointer`}
                                                onClick={() => handlePlanSelection(planKey)}
                                            >
                                                {/* Badge do plano */}
                                                <div className="text-center mb-4">
                                                    <h3 className="text-xl font-bold">{plan.title}</h3>
                                                    <p className="text-2xl font-bold mt-2">{plan.price}</p>
                                                </div>

                                                {/* Descrição */}
                                                <div className="text-sm space-y-2 mb-6">
                                                    {plan.description.split('\n').map((line, index) => (
                                                        <div key={index} className="flex items-center">
                                                            {line.startsWith('+') ? (
                                                                <>
                                                                    <span className="text-lg mr-2">+</span>
                                                                    <span>{line.substring(1).trim()}</span>
                                                                </>
                                                            ) : (
                                                                <span>{line}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Botão de seleção */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlanSelection(planKey);
                                                    }}
                                                    disabled={selectedPlanLoading !== null}
                                                    className="w-full bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 disabled:opacity-50 text-sm">
                                                    {selectedPlanLoading === planKey ? 'Processando...' : ''}
                                                </button>

                                                {/* Círculo de seleção */}
                                                <div className="absolute bottom-4 right-4">
                                                    <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Nota sobre plano Free */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Nota:</strong> Caso escolha o plano gratuito, você poderá atualizar para um plano pago posteriormente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
