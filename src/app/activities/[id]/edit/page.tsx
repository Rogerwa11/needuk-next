'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    Users,
    Save,
    Loader,
    AlertCircle,
    Plus,
    X,
    Link as LinkIcon,
    Mail,
    Trash2,
    UserPlus
} from 'lucide-react';
import { Input } from '@/components/ui';

interface Link {
    id: string;
    title: string;
    url: string;
}

interface Activity {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    startDate: string;
    endDate: string | null;
    createdBy: string;
    leaderId: string;
    participants: Array<{
        id: string;
        userId: string;
        role: string | null;
        user: ParticipantUser;
    }>;
    links: Array<{
        id: string;
        title: string;
        url: string;
    }>;
}

interface User {
    id: string;
    name: string;
    email: string;
    userType: string;
}

interface ParticipantUser {
    id: string;
    name: string;
    email: string;
    userType: string;
}

export default function EditActivityPage() {
    const params = useParams();
    const router = useRouter();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para gerenciamento de participantes
    const [showParticipantManagement, setShowParticipantManagement] = useState(false);
    const [participantEmails, setParticipantEmails] = useState<string[]>(['']);
    const [invitingParticipants, setInvitingParticipants] = useState(false);

    const activityId = params.id as string;

    // Estados do formulário
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending' as 'pending' | 'completed',
        startDate: '',
        endDate: '',
        links: [] as Link[]
    });

    // Buscar dados da atividade
    const fetchActivity = async () => {
        try {
            const response = await fetch(`/api/activities/${activityId}`);
            if (response.ok) {
                const result = await response.json();
                const activityData = result.success ? result.data.activity : result.activity;

                setActivity(activityData);

                // Preencher formulário com dados existentes
                setFormData({
                    title: activityData.title,
                    description: activityData.description || '',
                    status: activityData.status,
                    startDate: new Date(activityData.startDate).toISOString().slice(0, 16),
                    endDate: activityData.endDate ? new Date(activityData.endDate).toISOString().slice(0, 16) : '',
                    links: activityData.links || []
                });
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

    // Verificar permissões
    const isLeader = activity && currentUser && activity.leaderId === currentUser.id;

    // Gerenciar participantes
    const addParticipantEmail = () => {
        setParticipantEmails(prev => [...prev, '']);
    };

    const updateParticipantEmail = (index: number, email: string) => {
        setParticipantEmails(prev => prev.map((currentEmail, i) =>
            i === index ? email : currentEmail
        ));
    };

    const removeParticipantEmail = (index: number) => {
        if (participantEmails.length > 1) {
            setParticipantEmails(prev => prev.filter((_, i) => i !== index));
        }
    };

    const inviteParticipants = async () => {
        if (!activity) return;

        const validEmails = participantEmails.filter(email => email.trim() !== '');
        if (validEmails.length === 0) {
            alert('Adicione pelo menos um email válido');
            return;
        }

        setInvitingParticipants(true);
        try {
            const response = await fetch(`/api/activities/${activityId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emails: validEmails,
                    activityTitle: activity.title,
                }),
            });

            if (response.ok) {
                alert(`Convites enviados com sucesso para ${validEmails.length} participante(s)!`);
                setParticipantEmails(['']);
                setShowParticipantManagement(false);
                // Recarregar atividade para atualizar lista de participantes
                await fetchActivity();
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao enviar convites');
            }
        } catch (error) {
            console.error('Erro ao convidar participantes:', error);
            alert('Erro ao enviar convites');
        } finally {
            setInvitingParticipants(false);
        }
    };

    const removeParticipant = async (participantId: string, participantUser: { name: string; email: string }) => {
        if (!confirm(`Tem certeza que deseja remover ${participantUser.name || participantUser.email} desta atividade?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/activities/${activityId}/participants/${participantId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert(`${participantUser.name || participantUser.email} foi removido da atividade`);
                await fetchActivity();
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao remover participante');
            }
        } catch (error) {
            console.error('Erro ao remover participante:', error);
            alert('Erro ao remover participante');
        }
    };


    // Gerenciar links
    const addLink = () => {
        const newLink: Link = {
            id: Date.now().toString(),
            title: '',
            url: ''
        };
        setFormData(prev => ({
            ...prev,
            links: [...prev.links, newLink]
        }));
    };

    const updateLink = (id: string, field: 'title' | 'url', value: string) => {
        setFormData(prev => ({
            ...prev,
            links: prev.links.map(link =>
                link.id === id ? { ...link, [field]: value } : link
            )
        }));
    };

    const removeLink = (id: string) => {
        setFormData(prev => ({
            ...prev,
            links: prev.links.filter(link => link.id !== id)
        }));
    };

    // Validação do formulário
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Título é obrigatório';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Data de início é obrigatória';
        } else {
            const startDate = new Date(formData.startDate);
            if (isNaN(startDate.getTime())) {
                newErrors.startDate = 'Data de início inválida';
            }
        }

        if (formData.endDate) {
            const endDate = new Date(formData.endDate);
            if (isNaN(endDate.getTime())) {
                newErrors.endDate = 'Data de fim inválida';
            } else if (formData.startDate) {
                const startDate = new Date(formData.startDate);
                if (endDate <= startDate) {
                    newErrors.endDate = 'Data de fim deve ser posterior à data de início';
                }
            }
        }

        // Validar links
        formData.links.forEach((link, index) => {
            if (link.title.trim() || link.url.trim()) {
                if (!link.title.trim()) {
                    newErrors[`link_title_${index}`] = 'Título do link é obrigatório';
                }
                if (!link.url.trim()) {
                    newErrors[`link_url_${index}`] = 'URL do link é obrigatória';
                } else {
                    try {
                        new URL(link.url.trim());
                    } catch {
                        newErrors[`link_url_${index}`] = 'URL inválida';
                    }
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Salvar alterações
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            // Preparar dados para envio
            const updateData = {
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                status: formData.status,
                startDate: formData.startDate,
                endDate: formData.endDate || null,
            };

            const response = await fetch(`/api/activities/${activityId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push(`/activities/${activityId}`);
            } else {
                setErrors({ submit: data.error || 'Erro ao salvar alterações' });
            }
        } catch (error) {
            setErrors({ submit: 'Erro de conexão. Tente novamente.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!activity || !currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
                    <p className="text-gray-600 mb-6">Não foi possível carregar os dados da atividade.</p>
                    <Link href="/activities">
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                            Voltar para Atividades
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!isLeader) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
                    <p className="text-gray-600 mb-6">Apenas o líder da atividade pode editá-la.</p>
                    <Link href={`/activities/${activityId}`}>
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                            Voltar para Atividade
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between py-4 lg:hidden">
                        <div className="flex items-center gap-3">
                            <Link href={`/activities/${activityId}`}>
                                <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Editar Atividade</h1>
                                <p className="mt-1 text-xs text-gray-600 truncate max-w-xs">
                                    {activity.title}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:flex items-center justify-between py-6">
                        <div className="flex items-center gap-4">
                            <Link href={`/activities/${activityId}`}>
                                <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Editar Atividade</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Faça alterações na atividade "{activity.title}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulário */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Informações Básicas */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Informações Básicas
                        </h2>

                        <div className="space-y-6">
                            {/* Título */}
                            <Input
                                label="Título da Atividade *"
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                error={errors.title}
                                required
                            />

                            {/* Descrição */}
                            <Input
                                label="Descrição"
                                as="textarea"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="resize-vertical"
                            />

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'completed' }))}
                                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                                >
                                    <option value="pending">Pendente</option>
                                    <option value="completed">Concluída</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Datas */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Datas
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Data de Início */}
                            <Input
                                label="Data de Início *"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                error={errors.startDate}
                                required
                            />

                            {/* Data de Fim */}
                            <Input
                                label="Data de Fim (Opcional)"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                error={errors.endDate}
                            />
                        </div>
                    </div>

                    {/* Links */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <LinkIcon className="w-5 h-5" />
                                Links Relacionados
                            </h2>
                            <button
                                type="button"
                                onClick={addLink}
                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar Link
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.links.map((link, index) => (
                                <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-sm font-medium text-gray-700">
                                            Link {index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removeLink(link.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Título do Link"
                                            type="text"
                                            value={link.title}
                                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                                            placeholder="Ex: Documentação do projeto"
                                            error={errors[`link_title_${index}`]}
                                        />

                                        <Input
                                            label="URL"
                                            type="url"
                                            value={link.url}
                                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                            placeholder="https://exemplo.com"
                                            error={errors[`link_url_${index}`]}
                                        />
                                    </div>
                                </div>
                            ))}

                            {formData.links.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Nenhum link adicionado ainda.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Gerenciamento de Participantes */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Participantes ({activity.participants.length})
                            </h3>
                            {isLeader && (
                                <button
                                    type="button"
                                    onClick={() => setShowParticipantManagement(!showParticipantManagement)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Gerenciar Participantes
                                </button>
                            )}
                        </div>

                        {/* Lista de Participantes Atuais */}
                        <div className="space-y-3 mb-4">
                            {activity.participants.map((participant) => (
                                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {participant.userId === activity.leaderId ? '👑 ' : ''}
                                                {participant.user.name || participant.user.email}
                                            </p>
                                            {participant.role && (
                                                <p className="text-xs text-gray-600">{participant.role}</p>
                                            )}
                                        </div>
                                    </div>
                                    {isLeader && participant.userId !== currentUser?.id && (
                                        <button
                                            type="button"
                                            onClick={() => removeParticipant(participant.id, participant.user)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Remover participante"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Seção de Convites (expandível) */}
                        {showParticipantManagement && isLeader && (
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Convidar Novos Participantes
                                </h4>

                                <div className="space-y-3">
                                    {participantEmails.map((email, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                type="email"
                                                placeholder="email@exemplo.com"
                                                value={email}
                                                onChange={(e) => updateParticipantEmail(index, e.target.value)}
                                                className="flex-1 text-sm"
                                            />
                                            {participantEmails.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeParticipantEmail(index)}
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                    title="Remover email"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={addParticipantEmail}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Adicionar Email
                                        </button>

                                        <button
                                            type="button"
                                            onClick={inviteParticipants}
                                            disabled={invitingParticipants || participantEmails.every(email => email.trim() === '')}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {invitingParticipants ? (
                                                <>
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="w-4 h-4" />
                                                    Enviar Convites
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-3">
                                    Os participantes receberão um convite por email e poderão aceitar ou recusar.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Erro geral */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {errors.submit}
                            </p>
                        </div>
                    )}

                    {/* Botões */}
                    <div className="flex justify-end gap-4">
                        <Link href={`/activities/${activityId}`}>
                            <button
                                type="button"
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
