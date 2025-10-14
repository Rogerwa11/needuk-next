import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useForm } from '@/hooks/custom';
import { commonSchemas } from '@/utils/validation-helpers';
import { showSuccess, showError } from '@/components/ui';

export interface LoginFormData {
    email: string;
    password: string;
}

export const useLoginForm = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);

    // Hook de formulário com validação
    const form = useForm<LoginFormData>({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: commonSchemas.loginSimple,
        onSubmit: async (values) => {
            const result = await authClient.signIn.email({
                email: values.email.toLowerCase().trim(),
                password: values.password,
                callbackURL: '/dashboard'
            });

            // Verificar se houve erro na autenticação
            if (result?.error) {
                throw new Error(result.error.message || 'Email ou senha inválidos');
            }

            // Verificar se a autenticação foi bem-sucedida
            if (!result?.data) {
                throw new Error('Email ou senha inválidos');
            }
        },
        onSuccess: () => {
            showSuccess('Login realizado com sucesso!');
            authClient.revokeOtherSessions();
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        },
        onError: (error) => {
            if (error.includes('INVALID_EMAIL_OR_PASSWORD') ||
                error.includes('Invalid email or password') ||
                error.includes('Email ou senha inválidos')) {
                showError('Email ou senha inválidos. Tente novamente.');
            } else {
                showError('Erro ao fazer login. Tente novamente.');
            }
        },
    });

    // Focar no campo de email ao montar
    useEffect(() => {
        if (emailRef.current) {
            emailRef.current.focus();
        }
    }, []);

    return {
        // Estados do formulário
        form,

        // Estados adicionais
        showPassword,
        setShowPassword,
        emailRef,

        // Handlers
        handleSubmit: form.handleSubmit,

        // Valores do formulário (para compatibilidade)
        email: form.values.email,
        isEmailValid: !form.errors.email && form.values.email.length > 0,
        loading: form.isSubmitting,
    };
};