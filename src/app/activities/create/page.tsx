'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    X,
    Calendar,
    Users,
    Link as LinkIcon,
    Save,
    Loader
} from 'lucide-react';
import { Input, Button, FormError } from '@/components/ui';
import { cardStyles } from '@/constants/styles';

interface Link {
    id: string;
    title: string;
    url: string;
}

interface FormData {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    participantEmails: string[];
    links: Link[];
}

export default function CreateActivityPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        participantEmails: [],
        links: []
    });

    // Gerenciar emails dos participantes
    const addParticipantEmail = () => {
        setFormData(prev => ({
            ...prev,
            participantEmails: [...prev.participantEmails, '']
        }));
    };

    const updateParticipantEmail = (index: number, email: string) => {
        setFormData(prev => ({
            ...prev,
            participantEmails: prev.participantEmails.map((currentEmail, i) =>
                i === index ? email : currentEmail
            )
        }));
    };

    const removeParticipantEmail = (index: number) => {
        setFormData(prev => ({
            ...prev,
            participantEmails: prev.participantEmails.filter((_, i) => i !== index)
        }));
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
        }

        if (formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);

            if (endDate <= startDate) {
                newErrors.endDate = 'Data de fim deve ser posterior à data de início';
            }
        }

        // Validar emails dos participantes
        formData.participantEmails.forEach((email, index) => {
            if (email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    newErrors[`participant_${index}`] = 'Email inválido';
                }
            }
        });

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

    // Enviar formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Filtrar emails vazios e links incompletos
            const cleanData = {
                ...formData,
                participantEmails: formData.participantEmails.filter(email => email.trim()),
                links: formData.links.filter(link =>
                    link.title.trim() && link.url.trim()
                )
            };

            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/activities');
            } else {
                setErrors({ submit: data.error || 'Erro ao criar atividade' });
            }
        } catch (error) {
            setErrors({ submit: 'Erro de conexão. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center gap-4">
                            <Link href="/activities">
                                <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Criar Nova Atividade</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Preencha os detalhes da sua atividade
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
                    <div className={`${cardStyles.base} ${cardStyles.padding}`}>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Informações Básicas
                        </h2>

                        <div className="space-y-6">
                            {/* Título */}
                            <Input
                                label="Título da Atividade *"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ex: Projeto de Desenvolvimento Web"
                                error={errors.title}
                                required
                            />

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descreva os objetivos e detalhes da atividade..."
                                    rows={4}
                                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-vertical"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Datas */}
                    <div className={`${cardStyles.base} ${cardStyles.padding}`}>
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

                    {/* Participantes */}
                    <div className={`${cardStyles.base} ${cardStyles.padding}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Participantes
                            </h2>
                            <button
                                type="button"
                                onClick={addParticipantEmail}
                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.participantEmails.map((email, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => updateParticipantEmail(index, e.target.value)}
                                            placeholder="email@exemplo.com"
                                            error={errors[`participant_${index}`]}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeParticipantEmail(index)}
                                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}

                            {formData.participantEmails.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Nenhum participante adicionado ainda. Você será o líder da atividade.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div className={`${cardStyles.base} ${cardStyles.padding}`}>
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Título do Link
                                            </label>
                                            <Input
                                                value={link.title}
                                                onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                                                placeholder="Ex: Documentação do projeto"
                                                error={errors[`link_title_${index}`]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                URL
                                            </label>
                                            <Input
                                                type="url"
                                                value={link.url}
                                                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                                placeholder="https://exemplo.com"
                                                error={errors[`link_url_${index}`]}
                                            />
                                        </div>
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

                    {/* Erro geral */}
                    {errors.submit && (
                        <FormError error={errors.submit} />
                    )}

                    {/* Botões */}
                    <div className="flex justify-end gap-4">
                        <Link href="/activities">
                            <Button variant="outline" size="lg">
                                Cancelar
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={loading}
                            loadingText="Criando..."
                            icon={<Save className="w-4 h-4" />}
                        >
                            Criar Atividade
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
