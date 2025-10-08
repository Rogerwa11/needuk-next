'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    Edit,
    Trash2,
    MessageSquare,
    Link as LinkIcon,
    Plus,
    X,
    User,
    Crown,
    Award,
    Send,
    ExternalLink,
    MoreHorizontal
} from 'lucide-react';
import { Input, showSuccess, showError, showWarning, confirmDanger, confirmWarning } from '@/components/ui';

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
    creator: {
        id: string;
        name: string;
        email: string;
        userType: string;
    };
    leader: {
        id: string;
        name: string;
        email: string;
        userType: string;
    };
    participants: Array<{
        id: string;
        userId: string;
        user: {
            id: string;
            name: string;
            email: string;
            userType: string;
            image: string | null;
        };
        role: string | null;
    }>;
    observations: Array<{
        id: string;
        content: string;
        createdAt: string;
        updatedAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    links: Array<{
        id: string;
        title: string;
        url: string;
        createdAt: string;
    }>;
    _count: {
        participants: number;
        observations: number;
        links: number;
    };
}

interface User {
    id: string;
    name: string;
    email: string;
    userType: string;
}

export default function ActivityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [newObservation, setNewObservation] = useState('');
    const [showAddLink, setShowAddLink] = useState(false);
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [showTransferLeadership, setShowTransferLeadership] = useState(false);
    const [newLeaderId, setNewLeaderId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Estados para concessão de medalhas
    const [showMedalAward, setShowMedalAward] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [selectedMedalType, setSelectedMedalType] = useState<'GOLD' | 'SILVER' | 'BRONZE'>('BRONZE');
    const [medalReason, setMedalReason] = useState('');
    const [awardingMedal, setAwardingMedal] = useState(false);

    const activityId = params.id as string;

    // Buscar dados da atividade
    const fetchActivity = async () => {
        try {
            const response = await fetch(`/api/activities/${activityId}`);
            if (response.ok) {
                const result = await response.json();
                const activityData = result.success ? result.data.activity : result.activity;
                setActivity(activityData);
            } else {
                console.error('Erro ao buscar atividade');
                router.push('/activities');
            }
        } catch (error) {
            console.error('Erro ao buscar atividade:', error);
            router.push('/activities');
        }
    };

    // Buscar dados do usuário atual
    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const result = await response.json();
                const userData = result.success ? result.data.user : result.user;
                setCurrentUser(userData);
            }
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchActivity(), fetchCurrentUser()]);
            setLoading(false);
        };
        loadData();
    }, [activityId]);

    // Fechar menu mobile ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showMobileMenu && !target.closest('.mobile-menu')) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showMobileMenu]);

    // Verificações de permissão
    const isLeader = activity && currentUser && activity.leaderId === currentUser.id;
    const isParticipant = activity && currentUser && activity.participants.some(p => p.userId === currentUser.id);

    // Funções de manipulação
    const awardMedal = async () => {
        if (!selectedStudent || !selectedMedalType) {
            showWarning('Selecione um aluno e um tipo de medalha');
            return;
        }

        setAwardingMedal(true);
        try {
            const response = await fetch('/api/medals/award', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    medalType: selectedMedalType,
                    userId: selectedStudent,
                    activityId: activityId,
                    reason: medalReason.trim() || undefined,
                }),
            });

            if (response.ok) {
                showSuccess('Medalha concedida com sucesso!');
                setShowMedalAward(false);
                setSelectedStudent('');
                setSelectedMedalType('BRONZE');
                setMedalReason('');
                // Recarregar atividade para atualizar dados se necessário
                await fetchActivity();
            } else {
                const data = await response.json();
                showError(data.error || 'Erro ao conceder medalha');
            }
        } catch (error) {
            console.error('Erro ao conceder medalha:', error);
            showError('Erro ao conceder medalha');
        } finally {
            setAwardingMedal(false);
        }
    };

    const handleDeleteActivity = async () => {
        const confirmed = await confirmDanger('Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.', 'Excluir atividade');
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/activities/${activityId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/activities');
            } else {
                showError('Erro ao excluir atividade');
            }
        } catch (error) {
            console.error('Erro ao excluir atividade:', error);
            showError('Erro ao excluir atividade');
        }
    };

    const handleAddObservation = async () => {
        if (!newObservation.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/activities/${activityId}/observations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newObservation }),
            });

            if (response.ok) {
                setNewObservation('');
                fetchActivity(); // Recarregar dados
            } else {
                showError('Erro ao adicionar observação');
            }
        } catch (error) {
            console.error('Erro ao adicionar observação:', error);
            showError('Erro ao adicionar observação');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddLink = async () => {
        if (!newLink.title.trim() || !newLink.url.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/activities/${activityId}/links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newLink),
            });

            if (response.ok) {
                setNewLink({ title: '', url: '' });
                setShowAddLink(false);
                fetchActivity(); // Recarregar dados
            } else {
                showError('Erro ao adicionar link');
            }
        } catch (error) {
            console.error('Erro ao adicionar link:', error);
            showError('Erro ao adicionar link');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        const confirmed = await confirmWarning('Tem certeza que deseja remover este link?', 'Remover link');
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/activities/${activityId}/links/${linkId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchActivity(); // Recarregar dados
            } else {
                showError('Erro ao remover link');
            }
        } catch (error) {
            console.error('Erro ao remover link:', error);
            showError('Erro ao remover link');
        }
    };

    const handleLeaveActivity = async () => {
        const confirmed = await confirmWarning('Tem certeza que deseja abandonar esta atividade? Você perderá acesso a ela.', 'Abandonar atividade');
        if (!confirmed) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/activities/${activityId}/leave`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Você abandonou a atividade com sucesso.');
                // Aguardar um momento para garantir que a transação seja processada
                setTimeout(() => {
                    router.push('/activities');
                }, 500);
            } else {
                showError(data.error || 'Erro ao abandonar atividade');
            }
        } catch (error) {
            console.error('Erro ao abandonar atividade:', error);
            showError('Erro ao abandonar atividade');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteObservation = async (observationId: string) => {
        const confirmed = await confirmDanger('Tem certeza que deseja deletar esta observação? Esta ação não pode ser desfeita.', 'Deletar observação');
        if (!confirmed) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/activities/${activityId}/observations/${observationId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                // Recarregar dados da atividade para atualizar a lista de observações
                await fetchActivity();
                showSuccess('Observação deletada com sucesso!');
            } else {
                showError(data.error || 'Erro ao deletar observação');
            }
        } catch (error) {
            console.error('Erro ao deletar observação:', error);
            showError('Erro ao deletar observação');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTransferLeadership = async () => {
        if (!newLeaderId) {
            showWarning('Selecione um novo líder');
            return;
        }

        const confirmed = await confirmWarning('Tem certeza que deseja transferir a liderança desta atividade? Você perderá os privilégios de líder.', 'Transferir liderança');
        if (!confirmed) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/activities/${activityId}/transfer-leadership`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newLeaderId }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Liderança transferida com sucesso!');
                setShowTransferLeadership(false);
                setNewLeaderId('');
                // Recarregar dados da atividade para atualizar informações de liderança
                await fetchActivity();
                // Também recarregar dados do usuário atual para atualizar permissões
                await fetchCurrentUser();
            } else {
                showError(data.error || 'Erro ao transferir liderança');
            }
        } catch (error) {
            console.error('Erro ao transferir liderança:', error);
            showError('Erro ao transferir liderança');
        } finally {
            setSubmitting(false);
        }
    };

    // Formatação de datas
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
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

    if (loading || !activity || !currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!isParticipant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
                    <p className="text-gray-600 mb-6">Você não tem permissão para ver esta atividade.</p>
                    <Link href="/activities">
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                            Voltar para Atividades
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(activity.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between py-4 lg:hidden">
                        <div className="flex items-center gap-3">
                            <Link href="/activities">
                                <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 truncate max-w-xs">
                                    {activity.title}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusInfo.label}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {activity._count.participants} participantes
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="relative mobile-menu">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {showMobileMenu && (
                                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    {isLeader && (
                                        <>
                                            <Link href={`/activities/${activity.id}/edit`}>
                                                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                                    <Edit className="w-4 h-4" />
                                                    Editar atividade
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowTransferLeadership(true);
                                                    setShowMobileMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Crown className="w-4 h-4" />
                                                Transferir liderança
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDeleteActivity();
                                                    setShowMobileMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Excluir atividade
                                            </button>
                                        </>
                                    )}

                                    {isParticipant && !isLeader && (
                                        <button
                                            onClick={() => {
                                                handleLeaveActivity();
                                                setShowMobileMenu(false);
                                            }}
                                            disabled={submitting}
                                            className="w-full text-left px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <User className="w-4 h-4" />
                                            {submitting ? 'Saindo...' : 'Abandonar atividade'}
                                        </button>
                                    )}

                                    {isParticipant && currentUser?.userType === 'gestor' && (
                                        <button
                                            onClick={() => {
                                                setShowMedalAward(!showMedalAward);
                                                setShowMobileMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                                        >
                                            <Award className="w-4 h-4" />
                                            Conceder medalhas
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:flex items-center justify-between py-6">
                        <div className="flex items-center gap-4">
                            <Link href="/activities">
                                <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">
                                    {activity.title}
                                </h1>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusInfo.label}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {activity._count.participants} participantes
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Ações do líder */}
                        {isLeader && (
                            <div className="flex items-center gap-2">
                                <Link href={`/activities/${activity.id}/edit`}>
                                    <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-2">
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </button>
                                </Link>
                                <button
                                    onClick={() => setShowTransferLeadership(true)}
                                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
                                >
                                    <Crown className="w-4 h-4" />
                                    Transferir Liderança
                                </button>
                                <button
                                    onClick={handleDeleteActivity}
                                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                </button>
                            </div>
                        )}

                        {/* Ações do participante (não líder) */}
                        {isParticipant && !isLeader && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLeaveActivity}
                                    disabled={submitting}
                                    className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <User className="w-4 h-4" />
                                    {submitting ? 'Saindo...' : 'Abandonar Atividade'}
                                </button>
                            </div>
                        )}

                        {/* Ações do gestor (participante) */}
                        {isParticipant && currentUser?.userType === 'gestor' && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowMedalAward(!showMedalAward)}
                                    className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors flex items-center gap-2"
                                >
                                    <Award className="w-4 h-4" />
                                    Conceder Medalhas
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {/* Coluna Principal */}
                    <div className="md:col-span-1 xl:col-span-2 space-y-8">
                        {/* Descrição */}
                        {activity.description && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h2>
                                <p className="text-gray-700 leading-relaxed">{activity.description}</p>
                            </div>
                        )}

                        {/* Observações */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Observações ({activity.observations.length})
                                </h2>
                            </div>

                            {/* Lista de observações */}
                            <div className="space-y-4 mb-6">
                                {activity.observations.map((observation) => {
                                    // Verificar permissões para deletar
                                    const canDelete = observation.user.id === currentUser?.id || isLeader;

                                    return (
                                        <div key={observation.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {observation.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDateTime(observation.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Botão de deletar */}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDeleteObservation(observation.id)}
                                                        disabled={submitting}
                                                        className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={observation.user.id === currentUser?.id ? "Deletar sua observação" : "Deletar observação (líder)"}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-gray-700 ml-10">{observation.content}</p>
                                        </div>
                                    );
                                })}

                                {activity.observations.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">
                                        Nenhuma observação ainda. Seja o primeiro a contribuir!
                                    </p>
                                )}
                            </div>

                            {/* Adicionar observação */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Adicionar Observação</h3>
                                <div className="flex gap-3">
                                    <textarea
                                        value={newObservation}
                                        onChange={(e) => setNewObservation(e.target.value)}
                                        placeholder="Compartilhe seu progresso ou insights sobre esta atividade..."
                                        rows={4}
                                        className="resize-none px-4 py-3 text-left leading-relaxed placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border border-gray-300 rounded-lg w-full text-black"
                                    />
                                    <button
                                        onClick={handleAddObservation}
                                        disabled={submitting || !newObservation.trim()}
                                        className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {submitting ? 'Enviando...' : 'Enviar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Datas */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Datas
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Data de Início</p>
                                    <p className="text-black font-medium">{formatDate(activity.startDate)}</p>
                                </div>
                                {activity.endDate && (
                                    <div>
                                        <p className="text-sm text-gray-600">Data de Fim</p>
                                        <p className="font-medium">{formatDate(activity.endDate)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal de Transferência de Liderança */}
                        {showTransferLeadership && isLeader && (
                            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-gray-50 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Crown className="w-5 h-5" />
                                            Transferir Liderança
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowTransferLeadership(false);
                                                setNewLeaderId('');
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4">
                                        Escolha um novo líder para esta atividade. Você perderá os privilégios de líder.
                                    </p>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Novo Líder
                                        </label>
                                        <select
                                            value={newLeaderId}
                                            onChange={(e) => setNewLeaderId(e.target.value)}
                                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Selecione um participante</option>
                                            {activity.participants
                                                .filter(p => p.userId !== currentUser?.id) // Não incluir o líder atual
                                                .map((participant) => (
                                                    <option key={participant.userId} value={participant.userId}>
                                                        {participant.user.name} ({participant.role || 'Sem cargo'})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => {
                                                setShowTransferLeadership(false);
                                                setNewLeaderId('');
                                            }}
                                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleTransferLeadership}
                                            disabled={submitting || !newLeaderId}
                                            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Transferindo...' : 'Transferir'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Participantes */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Participantes ({activity.participants.length})
                            </h2>
                            <div className="space-y-3">
                                {activity.participants.map((participant) => (
                                    <div key={participant.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                {participant.user.image ? (
                                                    <img
                                                        src={participant.user.image}
                                                        alt={participant.user.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-4 h-4 text-purple-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {participant.user.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {participant.userId === activity.leaderId && (
                                                        <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                                                            Líder
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {participant.userId === activity.leaderId && (
                                            <Crown className="w-4 h-4 text-yellow-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <LinkIcon className="w-5 h-5" />
                                    Links ({activity.links.length})
                                </h2>
                                <button
                                    onClick={() => setShowAddLink(!showAddLink)}
                                    className="text-purple-600 hover:text-purple-700 p-1"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Formulário para adicionar link */}
                            {showAddLink && (
                                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                                    <div className="space-y-3">
                                        <Input
                                            type="text"
                                            placeholder="Título do link"
                                            value={newLink.title}
                                            onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                                            className="text-sm"
                                        />
                                        <Input
                                            type="url"
                                            placeholder="URL do link"
                                            value={newLink.url}
                                            onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                                            className="text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddLink}
                                                disabled={submitting || !newLink.title.trim() || !newLink.url.trim()}
                                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                {submitting ? 'Adicionando...' : 'Adicionar'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowAddLink(false);
                                                    setNewLink({ title: '', url: '' });
                                                }}
                                                className="text-gray-600 px-3 py-1 rounded text-sm hover:text-gray-700"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lista de links */}
                            <div className="space-y-2">
                                {activity.links.map((link) => (
                                    <div key={link.id} className="flex items-center justify-between group">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 truncate flex-1"
                                        >
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            {link.title}
                                        </a>
                                        <button
                                            onClick={() => handleDeleteLink(link.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {activity.links.length === 0 && !showAddLink && (
                                    <p className="text-gray-500 text-sm text-center py-4">
                                        Nenhum link adicionado ainda.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Concessão de Medalhas */}
            {showMedalAward && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-50 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Conceder Medalha
                            </h3>
                            <button
                                onClick={() => {
                                    setShowMedalAward(false);
                                    setSelectedStudent('');
                                    setSelectedMedalType('BRONZE');
                                    setMedalReason('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Selecionar Aluno */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selecionar Aluno
                                </label>
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                >
                                    <option value="">Selecione um aluno</option>
                                    {activity.participants
                                        .filter(p => p.user.userType === 'aluno')
                                        .map((participant) => (
                                            <option key={participant.userId} value={participant.userId}>
                                                {participant.user.name} ({participant.role || 'Sem função'})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Selecionar Tipo de Medalha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Medalha
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMedalType('BRONZE')}
                                        className={`text-black p-3 border rounded-lg text-center transition-colors ${selectedMedalType === 'BRONZE'
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-300 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🥉</div>
                                        <div className="text-sm font-medium">Bronze</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMedalType('SILVER')}
                                        className={`text-black p-3 border rounded-lg text-center transition-colors ${selectedMedalType === 'SILVER'
                                            ? 'border-gray-500 bg-gray-50'
                                            : 'border-gray-300 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🥈</div>
                                        <div className="text-sm font-medium">Prata</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMedalType('GOLD')}
                                        className={`text-black p-3 border rounded-lg text-center transition-colors ${selectedMedalType === 'GOLD'
                                            ? 'border-yellow-500 bg-yellow-50'
                                            : 'border-gray-300 hover:border-yellow-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🥇</div>
                                        <div className="text-sm font-medium">Ouro</div>
                                    </button>
                                </div>
                            </div>

                            {/* Motivo (opcional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo (opcional)
                                </label>
                                <Input
                                    as="textarea"
                                    value={medalReason}
                                    onChange={(e) => setMedalReason(e.target.value)}
                                    placeholder="Descreva o motivo da medalha..."
                                    rows={3}
                                    className="focus:ring-yellow-500"
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowMedalAward(false);
                                        setSelectedStudent('');
                                        setSelectedMedalType('BRONZE');
                                        setMedalReason('');
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={awardMedal}
                                    disabled={awardingMedal || !selectedStudent}
                                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {awardingMedal ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Concedendo...
                                        </>
                                    ) : (
                                        <>
                                            <Award className="w-4 h-4" />
                                            Conceder
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
