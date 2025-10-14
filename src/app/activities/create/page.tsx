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
import { useApi, useForm } from '@/hooks/custom';
import { commonSchemas } from '@/utils/validation-helpers';
import { showSuccess, showError } from '@/components/ui';

interface Link {
    id: string;
    title: string;
    url: string;
}

interface FormData {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    participantEmails: string[];
    links?: Link[];
}

export default function CreateActivityPage() {
    const router = useRouter();

    // Hook de formulário com validação
    const form = useForm<FormData>({
        initialValues: {
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            participantEmails: [],
            links: []
        } as FormData,
        // validationSchema: commonSchemas.activity, // Temporariamente removido por incompatibilidade de tipos
        onSuccess: (data) => {
            showSuccess('Atividade criada com sucesso!');
            router.push('/activities');
        },
        onError: (error) => showError(error || 'Erro ao criar atividade')
    });

    // API hook para criação
    const createActivityApi = useApi({
        onSuccess: () => {
            showSuccess('Atividade criada com sucesso!');
            router.push('/activities');
        },
        onError: (error) => showError(error || 'Erro ao criar atividade')
    });

    // Estado para erros (migração gradual)
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Gerenciar emails dos participantes
    const addParticipantEmail = () => {
        form.setFieldValue('participantEmails', [...form.values.participantEmails, '']);
    };

    const updateParticipantEmail = (index: number, email: string) => {
        // Validar email se não estiver vazio
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setErrors(prev => ({ ...prev, [`participant_${index}`]: 'Email inválido' }));
        } else {
            setErrors(prev => ({ ...prev, [`participant_${index}`]: '' }));
        }

        const updatedEmails = form.values.participantEmails.map((currentEmail, i) =>
            i === index ? email : currentEmail
        );
        form.setFieldValue('participantEmails', updatedEmails);
    };

    const removeParticipantEmail = (index: number) => {
        const filteredEmails = form.values.participantEmails.filter((_, i) => i !== index);
        form.setFieldValue('participantEmails', filteredEmails);
    };

    // Gerenciar links
    const addLink = () => {
        const newLink: Link = {
            id: Date.now().toString(),
            title: '',
            url: ''
        };
        form.setFieldValue('links', [...(form.values.links || []), newLink]);
    };

    const updateLink = (id: string, field: 'title' | 'url', value: string) => {
        const updatedLinks = (form.values.links || []).map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        form.setFieldValue('links', updatedLinks);
    };

    const removeLink = (id: string) => {
        const filteredLinks = (form.values.links || []).filter(link => link.id !== id);
        form.setFieldValue('links', filteredLinks);
    };

    // Validação do formulário usando commonSchemas
    const validateForm = async (): Promise<boolean> => {
        return await form.validate();
    };

    // Enviar formulário
    const handleSubmit = async (values: FormData) => {
        // Filtrar emails vazios e links incompletos
        const cleanData = {
            ...values,
            participantEmails: values.participantEmails.filter(email => email.trim()),
            links: (values.links || []).filter(link =>
                link.title.trim() && link.url.trim()
            )
        };

        createActivityApi.execute(() =>
            fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanData),
            }).then(res => res.json())
        );
    };

    // Wrapper para compatibilidade
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (await validateForm()) {
            await handleSubmit(form.values);
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
                <form onSubmit={handleFormSubmit} className="space-y-8">
                    {/* Informações Básicas */}
                    <div className={`${cardStyles.base} ${cardStyles.padding}`}>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Informações Básicas
                        </h2>

                        <div className="space-y-6">
                            {/* Título */}
                            <Input
                                label="Título da Atividade *"
                                value={form.values.title}
                                onChange={(e) => form.setFieldValue('title', e.target.value)}
                                placeholder="Ex: Projeto de Desenvolvimento Web"
                                error={form.errors.title}
                                required
                            />

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                value={form.values.description}
                                onChange={(e) => form.setFieldValue('description', e.target.value)}
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
                                value={form.values.startDate}
                                onChange={(e) => form.setFieldValue('startDate', e.target.value)}
                                error={form.errors.startDate}
                                required
                            />

                            {/* Data de Fim */}
                            <Input
                                label="Data de Fim (Opcional)"
                                type="datetime-local"
                                value={form.values.endDate}
                                onChange={(e) => form.setFieldValue('endDate', e.target.value)}
                                error={form.errors.endDate}
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
                            {form.values.participantEmails.map((email, index) => (
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

                            {form.values.participantEmails.length === 0 && (
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
                            {(form.values.links || []).map((link, index) => (
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

                            {(form.values.links || []).length === 0 && (
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
                            loading={createActivityApi.loading}
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
