'use client'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Building, GraduationCap, Phone, MapPin, Mail } from 'lucide-react'

export default function Dashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    const handleLogout = async () => {
        setLoading(true)
        try {
            // Limpar qualquer storage local se houver
            if (typeof window !== 'undefined') {
                localStorage.clear()
                sessionStorage.clear()
            }

            // Fazer logout do NextAuth
            await signOut({
                redirect: false,
                callbackUrl: '/login'
            })

            // Redirecionar para login
            router.push('/login')

            // Opcional: recarregar a página para garantir limpeza completa
            setTimeout(() => {
                window.location.href = '/login'
            }, 100)

        } catch (error) {
            console.error('Erro ao fazer logout:', error)
            // Em caso de erro, forçar redirecionamento
            window.location.href = '/login'
        } finally {
            setLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        return null
    }

    const getUserTypeIcon = (userType: string) => {
        switch (userType?.toLowerCase()) {
            case 'aluno':
                return <GraduationCap className="w-6 h-6 text-blue-600" />
            case 'recrutador':
                return <Building className="w-6 h-6 text-green-600" />
            case 'gestor':
                return <User className="w-6 h-6 text-purple-600" />
            default:
                return <User className="w-6 h-6 text-gray-600" />
        }
    }

    const getUserTypeColor = (userType: string) => {
        switch (userType?.toLowerCase()) {
            case 'aluno':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'recrutador':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'gestor':
                return 'bg-purple-100 text-purple-800 border-purple-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-indigo-600">Needuk</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                {getUserTypeIcon(session?.user?.userType || '')}
                                <span className="text-gray-700 font-medium">
                                    {session?.user?.name}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <LogOut className="w-4 h-4 mr-2" />
                                )}
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Welcome Section */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {getUserTypeIcon(session?.user?.userType || '')}
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Bem-vindo de volta!
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {session?.user?.name}
                                            </div>
                                            <div className={`ml-3 inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium border ${getUserTypeColor(session?.user?.userType || '')}`}>
                                                {session?.user?.userType ?
                                                    session.user.userType.charAt(0).toUpperCase() + session.user.userType.slice(1).toLowerCase()
                                                    : 'Usuário'}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Informações da Conta
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-sm text-gray-900">{session?.user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tipo de Usuário</p>
                                        <p className="text-sm text-gray-900">
                                            {session?.user?.userType ?
                                                session.user.userType.charAt(0).toUpperCase() + session.user.userType.slice(1).toLowerCase()
                                                : 'Usuário'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Ações Rápidas
                        </h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <User className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Perfil
                                                </dt>
                                                <dd className="text-sm text-gray-900">
                                                    Editar informações
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <button className="font-medium text-indigo-600 hover:text-indigo-500">
                                            Visualizar perfil
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {session?.user?.userType?.toLowerCase() === 'aluno' && (
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <GraduationCap className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Oportunidades
                                                    </dt>
                                                    <dd className="text-sm text-gray-900">
                                                        Buscar vagas
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-5 py-3">
                                        <div className="text-sm">
                                            <button className="font-medium text-blue-600 hover:text-blue-500">
                                                Ver oportunidades
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {session?.user?.userType?.toLowerCase() === 'recrutador' && (
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Building className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Vagas
                                                    </dt>
                                                    <dd className="text-sm text-gray-900">
                                                        Gerenciar vagas
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-5 py-3">
                                        <div className="text-sm">
                                            <button className="font-medium text-green-600 hover:text-green-500">
                                                Criar vaga
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
