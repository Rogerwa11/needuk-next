import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authClient.getSession();
                if (session.data?.user) {
                    setUser(session.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const signOut = async () => {
        try {
            await authClient.signOut();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        signOut
    };
};

// Hook específico para redirecionamento se já estiver logado
export const useAuthRedirect = (redirectTo: string = '/dashboard') => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push(redirectTo);
        }
    }, [user, loading, router, redirectTo]);

    return { user, loading, isAuthenticated: !!user };
};