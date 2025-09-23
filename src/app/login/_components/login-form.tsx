import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export interface LoginFormData {
    email: string;
    password: string;
}

export const useLoginForm = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const emailRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (emailRef.current) {
            emailRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const valid = emailRegex.test(email);
                setIsEmailValid(valid);
                if (valid) {
                    setErrors(prev => ({ ...prev, email: '' }));
                } else {
                    setErrors(prev => ({ ...prev, email: 'Por favor, insira um email válido' }));
                }
            } else {
                setIsEmailValid(false);
                setErrors(prev => ({ ...prev, email: '' }));
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [email]);

    // Validação de senha
    useEffect(() => {
        if (password) {
            if (password.length < 8) {
                setErrors(prev => ({ ...prev, password: 'A senha deve ter pelo menos 8 caracteres' }));
            } else {
                setErrors(prev => ({ ...prev, password: '' }));
            }
        } else {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    }, [password]);

    // Função para mostrar toast
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

        // Validação com Zod
        try {
            loginSchema.parse({ email, password });
            setErrors({});
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
            return;
        }

        setLoading(true);

        //await authClient.revokeOtherSessions()

        await authClient.signIn.email({
            email: email.toLowerCase().trim(),
            password: password,
            callbackURL: '/dashboard'
        }, {
            onSuccess: (ctx) => {
                showToastMessage('Login realizado com sucesso!', 'success');
                authClient.revokeOtherSessions();
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            },
            onError: (ctx) => {
                if (ctx.error.code === 'INVALID_EMAIL_OR_PASSWORD') {
                    showToastMessage('Email ou senha inválidos. Tente novamente.', 'error');
                } else {
                    showToastMessage('Erro ao fazer login. Tente novamente.', 'error');
                }
            }
        })
        setLoading(false);
    };

    // Navegação com Enter
    const handleKeyDown = (e: React.KeyboardEvent, nextField?: () => void) => {
        if (e.key === 'Enter' && nextField) {
            nextField();
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    };

    return {
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
        showToastMessage,
    };
};