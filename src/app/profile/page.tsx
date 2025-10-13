import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from './_components'
import { prisma } from '@/lib/prisma'

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect('/')
    }

    // Buscar dados completos do usuário incluindo medalhas
    const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            userType: true,
            cpf: true,
            cnpj: true,
            telefone: true,
            endereco: true,
            cidade: true,
            estado: true,
            cep: true,
            plan: true,
            goldMedals: true,
            silverMedals: true,
            bronzeMedals: true,
            curso: true,
            universidade: true,
            periodo: true,
            nomeEmpresa: true,
            cargo: true,
            setor: true,
            nomeUniversidade: true,
            departamento: true,
            cargoGestor: true,
        }
    })

    if (!userData) {
        redirect('/')
    }

    return (
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
                <ProfileForm user={userData} />
            </div>
        </div>
    )
}
