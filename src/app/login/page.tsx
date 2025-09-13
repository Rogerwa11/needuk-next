'use client'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const emailRef = useRef<HTMLInputElement>(null);

    // Redirecionar se já estiver logado
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard');
        }
    }, [status, router]);

    // Auto-focus no email ao carregar
    useEffect(() => {
        if (emailRef.current) {
            emailRef.current.focus();
        }
    }, []);

    // CORRIGIR - Validação de email em tempo real com debounce
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
            const result = await signIn('credentials', {
                email: email.toLowerCase().trim(),
                password,
                redirect: false,
            });

            if (result?.error) {
                showToastMessage('Email ou senha incorretos!', 'error');
            } else if (result?.ok) {
                showToastMessage('Login realizado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            }
        } catch (error) {
            console.error('Erro no login:', error);
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
                    {toastType === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <XCircle className="h-5 w-5" />
                    )}
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

                        {/* Link esqueceu senha */}
                        <div className="flex items-center justify-center w-full max-w-md">
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