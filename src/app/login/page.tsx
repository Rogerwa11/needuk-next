'use client'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const emailRef = useRef<HTMLInputElement>(null);

    // Auto-focus no email ao carregar
    useEffect(() => {
        if (emailRef.current) {
            emailRef.current.focus();
        }
    }, []);

    // Validação de email em tempo real com debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const valid = emailRegex.test(email);
                setIsEmailValid(valid);
                setEmailError(valid ? '' : 'Por favor, insira um email válido');
            } else {
                setIsEmailValid(false);
                setEmailError('');
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [email]);

    // Validação de senha
    useEffect(() => {
        if (password) {
            if (password.length < 6) {
                setPasswordError('A senha deve ter pelo menos 6 caracteres');
            } else {
                setPasswordError('');
            }
        } else {
            setPasswordError('');
        }
    }, [password]);

    // mostrar toast
    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEmailValid) {
            showToastMessage('Por favor, corrija o email antes de continuar', 'error');
            return;
        }

        if (password.length < 6) {
            showToastMessage('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        setLoading(true);

        try {
            // requisição
            console.log('Login:', { email, password, rememberMe });

            await new Promise(resolve => setTimeout(resolve, 1500));

            showToastMessage('Login realizado com sucesso!', 'success');
        } catch (error) {
            showToastMessage('Erro ao fazer login. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Navegação com Enter
    const handleKeyDown = (e: React.KeyboardEvent, nextField?: () => void) => {
        if (e.key === 'Enter' && nextField) {
            e.preventDefault();
            nextField();
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
                    <div className="flex items-center justify-center mb-8">
                        <div className="">
                            <Image
                                src="/logo.png"
                                alt="Needuk"
                                width={180}
                                height={180}
                                className="w-32 h-32 md:w-64 md:h-44 object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Título Principal */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-gradient">
                            Seja bem-vindo!
                        </span>
                    </h1>

                    <p className="text-gray-600 text-center mb-8">
                        Faça login para continuar
                    </p>

                    {/* Formulário de Login */}
                    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
                        {/* Campo Email */}
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label
                                htmlFor="email"
                                className="text-gray-700 font-semibold"
                            >
                                Email
                            </label>
                            <div className="relative w-full">
                                <input
                                    ref={emailRef}
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, () => document.getElementById('password')?.focus())}
                                    required
                                    placeholder="seu@email.com"
                                    className={`w-full text-black px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 placeholder-gray-400 ${emailError
                                        ? 'border-red-500 focus:ring-red-500'
                                        : isEmailValid && email
                                            ? 'border-green-500 focus:ring-green-500'
                                            : 'border-gray-300 focus:ring-purple-500 hover:border-gray-400'
                                        }`}
                                />
                                {/* Ícone de validação */}
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
                            {emailError && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {emailError}
                                </p>
                            )}
                        </div>

                        {/* Campo Senha */}
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <label
                                htmlFor="password"
                                className="text-gray-700 font-semibold"
                            >
                                Senha
                            </label>
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e)}
                                    required
                                    placeholder="••••••••"
                                    className={`w-full text-black px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 placeholder-gray-400 ${passwordError
                                        ? 'border-red-500 focus:ring-red-500'
                                        : password && password.length >= 6
                                            ? 'border-green-500 focus:ring-green-500'
                                            : 'border-gray-300 focus:ring-purple-500 hover:border-gray-400'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>


                            {passwordError && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* Links auxiliares */}
                        <div className="flex items-center justify-between gap-4 text-sm w-full max-w-md">
                            <label className="flex items-center cursor-pointer hover:text-purple-600 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all duration-200"
                                />
                                <span className="text-gray-600">Lembrar-me</span>
                            </label>
                            <Link
                                href="#"
                                className="text-purple-600 hover:text-purple-700 font-medium transition-all duration-200 hover:scale-105"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>

                        {/* Botão ENTRAR */}
                        <button
                            type="submit"
                            disabled={loading || !isEmailValid || passwordError !== ''}
                            className="cursor-pointer w-[200px] bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:scale-105 active:scale-95"
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
                            <span className="px-4 bg-white text-gray-500">ou</span>
                        </div>
                    </div>

                    {/* Botões de login social */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200 hover:shadow-md hover:scale-105">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-gray-700">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200 hover:shadow-md hover:scale-105">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-gray-700">GitHub</span>
                        </button>
                    </div>

                    {/* Link para cadastro */}
                    <p className="text-center text-gray-600">
                        Ainda não tem uma conta?{' '}
                        <Link
                            href="/register"
                            className="text-purple-600 hover:text-purple-700 font-semibold transition-all duration-200 hover:scale-105 inline-block"
                        >
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}