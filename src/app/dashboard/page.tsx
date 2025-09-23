import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/app/dashboard/_components';

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        redirect('/')
    }

    return (
        <DashboardLayout user={session.user}>
            <div className="p-6">
                {/* Header da Dashboard */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Bem-vindo de volta, {session.user.name || session.user.email}!
                    </p>
                </div>

                {/* Blocos Informativos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Bloco 1 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Estatísticas Gerais
                            </h3>
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl">📊</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-600 text-sm">Total de atividades</p>
                            <p className="text-2xl font-bold text-gray-800">--</p>
                            <p className="text-green-600 text-sm">Em breve</p>
                        </div>
                    </div>

                    {/* Bloco 2 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Atividades Recentes
                            </h3>
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl">📋</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-600 text-sm">Última atividade</p>
                            <p className="text-2xl font-bold text-gray-800">--</p>
                            <p className="text-blue-600 text-sm">Em breve</p>
                        </div>
                    </div>

                    {/* Bloco 3 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Próximas Tarefas
                            </h3>
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl">⏰</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-600 text-sm">Tarefas pendentes</p>
                            <p className="text-2xl font-bold text-gray-800">--</p>
                            <p className="text-orange-600 text-sm">Em breve</p>
                        </div>
                    </div>
                </div>

                {/* Seção adicional baseada no tipo de usuário */}
                <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Área Específica - {session.user.userType}
                        </h2>
                        <p className="text-gray-600">
                            Conteúdo específico para {session.user.userType} será adicionado aqui.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}