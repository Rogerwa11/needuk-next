import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/app/dashboard/_components'
import { ProfileForm } from './_components'

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect('/')
    }

    return (
        <DashboardLayout user={session.user}>
            <div className="min-h-full flex items-center justify-center p-6">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Meu Perfil
                        </h1>
                        <p className="text-gray-600">
                            Gerencie suas informações pessoais e preferências
                        </p>
                    </div>

                    {/* Formulário de Perfil */}
                    <ProfileForm user={session.user} />
                </div>
            </div>
        </DashboardLayout>
    )
}
