'use client'
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useLoginForm } from './_components/login-form';
import { useAuthRedirect } from '@/hooks/useAuth';
import { AuthLoadingScreen } from '@/app/_components/AuthLoadingScreen';
import { Logo } from '@/app/_components/logo';

export default function LoginPage() {
    const { loading: authLoading } = useAuthRedirect('/dashboard');

    const {
        // Estados
        showPassword,
        setShowPassword,
        email,
        password,
        loading,
        errors,
        isEmailValid,
        showToast,
        toastMessage,
        toastType,
        emailRef,

        // Handlers
        handleSubmit,
        handleKeyDown,
        handleEmailChange,
        handlePasswordChange,
    } = useLoginForm();

    if (authLoading) {
        return <AuthLoadingScreen />;
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

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 md:p-10">
                    {/* Logo */}
                    <Logo />

                    {/* Título Principal */}
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            Bem-vindo de volta!
                        </span>
                    </h1>

                    <p className="text-gray-600 text-center mb-8">
                        Faça login para acessar sua conta
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-gray-700 font-semibold block">Email</label>
                            <div className="relative">
                                <input
                                    ref={emailRef}
                                    type="email"
                                    value={email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, () => document.getElementById('password')?.focus())}
                                    placeholder="seu@email.com"
                                    className={`w-full text-black px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.email
                                        ? 'border-red-500 focus:ring-red-500'
                                        : isEmailValid && email
                                            ? 'border-green-500 focus:ring-green-500'
                                            : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                />
                                {email && (
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
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <label className="text-gray-700 font-semibold block">Senha</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(e as any))}
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
                            {errors.password && (
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Link Esqueci a Senha */}
                        <div className="flex justify-end">
                            <Link
                                href="#"
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>

                        {/* Botão de Login */}
                        <button
                            type="submit"
                            disabled={loading || !isEmailValid || !password || errors.password !== ''}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Entrando...
                                </span>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Divisor */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">ou</span>
                        </div>
                    </div>

                    {/* Link para Cadastro */}
                    <div className="text-center">
                        <p className="text-gray-600">
                            Não tem uma conta?{' '}
                            <Link
                                href="/signup"
                                className="text-purple-600 hover:text-purple-700 font-semibold transition-all duration-200 hover:scale-105 inline-block"
                            >
                                Cadastre-se
                            </Link>
                        </p>
                    </div>

                    {/* Termos */}
                    <p className="text-xs text-gray-500 mt-8 text-center leading-relaxed">
                        Ao fazer login, você aceita os{' '}
                        <Link href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                            Termos de Uso
                        </Link>
                        {' '}e{' '}
                        <Link href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                            Política de Privacidade
                        </Link>
                        {' '}da Needuk.
                    </p>
                </div>
            </div>
        </div>
    );
};