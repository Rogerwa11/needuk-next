"use client"

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export const ButtonSignout = (): React.JSX.Element => {
    const router = useRouter()

    async function handleSignout() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/')
                }
            }
        });
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