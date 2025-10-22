"use client"

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { LogOut } from 'lucide-react'

interface ButtonSignoutProps {
    variant?: 'default' | 'dropdown';
}

export const ButtonSignout = ({ variant = 'default' }: ButtonSignoutProps): React.JSX.Element => {
    const router = useRouter()

    async function handleSignout() {
        try {
          await authClient.signOut(); // POST /api/auth/sign-out
        } catch (_) {
          // se já não houver sessão, ignore
        } finally {
          window.location.href = '/';
        }
      }

    if (variant === 'dropdown') {
        return (
            <button
                onClick={handleSignout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
                <LogOut className="w-4 h-4 mr-3" />
                Sair
            </button>
        );
    }

    return (
        <button
            onClick={handleSignout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
            Sair
        </button>
    );
}