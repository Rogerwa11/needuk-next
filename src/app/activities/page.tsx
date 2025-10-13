'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/app/_components/logo';
import { showSuccess, showError, confirmWarning } from '@/components/ui';

import {
    Plus,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    Filter,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    UserPlus
} from 'lucide-react';

// Interfaces para as atividades
interface Activity {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    startDate: string;
    endDate: string | null;
    createdBy: string;
    leaderId: string;
    createdAt: string;
    _count?: {
        participants: number;
    };
    participants?: Array<{
        id: string;
        userId: string;
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
        role: string | null;
    }>;
}

export default function ActivitiesPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'created' | 'participating'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    // Buscar atividades
    const fetchActivities = async () => {
        try {
            const response = await fetch('/api/activities');
            if (response.ok) {
                const result = await response.json();
                const activitiesData = result.success ? result.data.activities : result.activities;
                setActivities(activitiesData);
            }
        } catch (error) {
            console.error('Erro ao buscar atividades:', error);
        } finally {
            setLoading(false);
        }
    };

    // Funções do menu de ações
    const handleViewActivity = (activityId: string) => {
        router.push(`/activities/${activityId}`);
        setMenuOpen(null);
    };

    const handleEditActivity = (activityId: string) => {
        router.push(`/activities/${activityId}/edit`);
        setMenuOpen(null);
    };

    const handleLeaveActivity = async (activityId: string) => {
        const confirmed = await confirmWarning('Tem certeza que deseja abandonar esta atividade? Você perderá acesso a ela.', 'Abandonar atividade');
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/activities/${activityId}/leave`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Você abandonou a atividade com sucesso.');
                // Aguardar um momento para garantir que a transação seja processada
                setTimeout(() => {
                    fetchActivities(); // Recarregar lista
                }, 500);
            } else {
                showError(data.error || 'Erro ao abandonar atividade');
            }
        } catch (error) {
            console.error('Erro ao abandonar atividade:', error);
            showError('Erro ao abandonar atividade');
        } finally {
            setMenuOpen(null);
        }
    };

    const toggleMenu = (activityId: string) => {
        setMenuOpen(menuOpen === activityId ? null : activityId);
    };

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = () => {
            setMenuOpen(null);
        };

        if (menuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [menuOpen]);

    useEffect(() => {
        if (user) {
            fetchActivities();
        }
    }, [user]);

    // Filtrar atividades baseado nos critérios
    const filteredActivities = activities.filter(activity => {
        // Filtro por tipo (todas, criadas, participando)
        if (filter === 'created' && activity.createdBy !== user.id) return false;
        if (filter === 'participating' && activity.createdBy === user.id) return false;

        // Filtro por status
        if (statusFilter !== 'all' && activity.status !== statusFilter) return false;

        // Filtro por busca
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return activity.title.toLowerCase().includes(searchLower) ||
                activity.description?.toLowerCase().includes(searchLower);
        }

        return true;
    });

    // Formatar data
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Status da atividade
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: Clock,
                    label: 'Pendente',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100'
                };
            case 'completed':
                return {
                    icon: CheckCircle,
                    label: 'Concluída',
                    color: 'text-green-600',
                    bgColor: 'bg-green-100'
                };
            default:
                return {
                    icon: AlertCircle,
                    label: 'Desconhecido',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100'
                };
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header da página - mais simples */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Gerencie suas atividades e convites
                            </p>
                        </div>
                        <Link href="/activities/create">
                            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-800 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Nova Atividade
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                        {/* Filtros */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as any)}
                                    className="text-gray-500 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[180px]"
                                >
                                    <option value="all">Todas as atividades</option>
                                    <option value="created">Criadas por mim</option>
                                    <option value="participating">Que participo</option>
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="text-gray-500 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]"
                                >
                                    <option value="all">Todos os status</option>
                                    <option value="pending">Pendentes</option>
                                    <option value="completed">Concluídas</option>
                                </select>
                            </div>
                        </div>

                        {/* Busca */}
                        <div className="relative w-full lg:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar atividades..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Atividades */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredActivities.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade ainda'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm
                                ? 'Tente ajustar seus filtros de busca'
                                : 'Comece criando sua primeira atividade'
                            }
                        </p>
                        {!searchTerm && (
                            <Link href="/activities/create">
                                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-800 transition-colors">
                                    Criar Primeira Atividade
                                </button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredActivities.map((activity) => {
                            const statusInfo = getStatusInfo(activity.status);
                            const StatusIcon = statusInfo.icon;
                            const isLeader = activity.leaderId === user.id;
                            const isCreator = activity.createdBy === user.id;

                            return (
                                <div key={activity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                                {activity.title}
                                            </h3>
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusInfo.label}
                                            </div>
                                        </div>

                                        {/* Menu de ações */}
                                        <div className="relative ml-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(activity.id);
                                                }}
                                                className="p-1 rounded-lg hover:bg-gray-100"
                                            >
                                                <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {menuOpen === activity.id && (
                                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                    <button
                                                        onClick={() => handleViewActivity(activity.id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver atividade
                                                    </button>

                                                    {activity.leaderId === user?.id && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditActivity(activity.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Editar atividade
                                                            </button>
                                                        </>
                                                    )}

                                                    {activity.participants?.some(p => p.userId === user?.id) &&
                                                        activity.leaderId !== user?.id && (
                                                            <button
                                                                onClick={() => handleLeaveActivity(activity.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <UserPlus className="w-4 h-4" />
                                                                Abandonar atividade
                                                            </button>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Descrição */}
                                    {activity.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {activity.description}
                                        </p>
                                    )}

                                    {/* Datas */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Início: {formatDate(activity.startDate)}</span>
                                        </div>
                                        {activity.endDate && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>Fim: {formatDate(activity.endDate)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Participantes */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users className="w-4 h-4" />
                                            <span>{activity._count?.participants || 0} participantes</span>
                                        </div>

                                        {/* Indicadores de liderança */}
                                        <div className="flex gap-1">
                                            {isCreator && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Criador
                                                </span>
                                            )}
                                            {isLeader && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    Líder
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2">
                                        <Link href={`/activities/${activity.id}`}>
                                            <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                Ver
                                            </button>
                                        </Link>

                                        {isLeader && (
                                            <Link href={`/activities/${activity.id}/edit`}>
                                                <button className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1">
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
