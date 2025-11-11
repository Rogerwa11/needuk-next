'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, useApi } from '@/hooks/custom';
import { useCep } from '@/hooks/custom/useCep';
import { useCourses, useUniversities } from '@/hooks/custom/useAutocomplete';
import { commonSchemas, validationUtils } from '@/utils/validation-helpers';
import { showSuccess, showError, AutocompleteInput } from '@/components/ui';
import { UF_OPTIONS } from '@/constants/ufs';
import { cardStyles } from '@/constants/styles';
import {
    User,
    MapPin,
    Phone,
    Mail,
    FileText,
    Building,
    GraduationCap,
    Briefcase,
    CheckCircle,
    XCircle,
    AlertCircle,
    Save,
    Loader,
    Camera,
    Upload,
    Award,
    BadgeCheck,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

// Usar schema comum para perfil
const experienceSchema = z.object({
    company: z.string().min(1, 'Empresa é obrigatória').max(120),
    role: z.string().min(1, 'Função é obrigatória').max(120),
    details: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
    startDate: z.string().min(1, 'Data inicial é obrigatória'),
    endDate: z.string().optional(),
}).refine(v => !v.endDate || new Date(v.endDate) > new Date(v.startDate), {
    message: 'Data de fim deve ser posterior ao início', path: ['endDate']
});

const profileSchema = z.object({
    ...commonSchemas.profile.shape,
    // Campos específicos do perfil extendido
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    cep: z.string().min(9, 'CEP é obrigatório'),
    telefone: z.string()
        .min(14, 'Telefone é obrigatório')
        .refine((telefone) => {
            // Remove formatação para validar
            const cleaned = telefone.replace(/\D/g, '');
            return cleaned.length === 10 || cleaned.length === 11; // Telefones: 10 dígitos (fixo) ou 11 dígitos (celular)
        }, 'Telefone deve ter 10 ou 11 dígitos')
        .refine(validationUtils.isValidPhone, 'Telefone inválido'),
    // Campos específicos por tipo de usuário
    curso: z.string().optional(),
    universidade: z.string().optional(),
    periodo: z.string().optional(),
    nomeEmpresa: z.string().optional(),
    cargo: z.string().optional(),
    setor: z.string().optional(),
    nomeUniversidade: z.string().optional(),
    departamento: z.string().optional(),
    cargoGestor: z.string().optional(),
    // Perfil estendido
    aboutMe: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
    experiences: z.array(experienceSchema).max(20, 'Máximo de 20 experiências').optional(),
});

type ProfileData = z.infer<typeof profileSchema> & { image?: string };

interface ProfileFormProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        image?: string | null;
        telefone: string;
        endereco: string;
        cidade: string;
        estado: string;
        cep: string;
        userType: string;
        goldMedals?: number;
        silverMedals?: number;
        bronzeMedals?: number;
        badgesReceived?: {
            id: string;
            badgeId: string;
            badgeName: string;
            badgeDescription?: string | null;
            badgeIcon?: string | null;
            badgeColor?: string | null;
            note?: string | null;
            createdAt: string;
            activity?: { id: string; title: string };
            awardedBy?: { id: string; name: string };
        }[];
        cpf?: string | null;
        cnpj?: string | null;
        curso?: string | null;
        universidade?: string | null;
        periodo?: string | null;
        nomeEmpresa?: string | null;
        cargo?: string | null;
        setor?: string | null;
        nomeUniversidade?: string | null;
        departamento?: string | null;
        cargoGestor?: string | null;
        aboutMe?: string | null;
        experiences?: { id?: string; company: string; role: string; details?: string | null; startDate: string | Date; endDate?: string | Date | null }[];
    };
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const badges = user.badgesReceived || [];
    const aggregatedBadges = useMemo(() => {
        const grouped = new Map<
            string,
            {
                badgeId: string;
                badgeName: string;
                badgeIcon: string | null;
                badgeColor: string | null;
                description: string | null;
                count: number;
                latestCreatedAt: string;
                awardedByNames: Set<string>;
                activityTitles: Set<string>;
                notes: string[];
            }
        >();

        badges.forEach((badge) => {
            const existing = grouped.get(badge.badgeId);
            if (existing) {
                existing.count += 1;
                if (badge.awardedBy?.name) {
                    existing.awardedByNames.add(badge.awardedBy.name);
                }
                if (badge.activity?.title) {
                    existing.activityTitles.add(badge.activity.title);
                }
                if (badge.note) {
                    existing.notes.push(badge.note);
                }
                if (new Date(badge.createdAt).getTime() > new Date(existing.latestCreatedAt).getTime()) {
                    existing.latestCreatedAt = badge.createdAt;
                }
            } else {
                grouped.set(badge.badgeId, {
                    badgeId: badge.badgeId,
                    badgeName: badge.badgeName,
                    badgeIcon: badge.badgeIcon ?? null,
                    badgeColor: badge.badgeColor ?? null,
                    description: badge.badgeDescription ?? null,
                    count: 1,
                    latestCreatedAt: badge.createdAt,
                    awardedByNames: new Set(badge.awardedBy?.name ? [badge.awardedBy.name] : []),
                    activityTitles: new Set(badge.activity?.title ? [badge.activity.title] : []),
                    notes: badge.note ? [badge.note] : [],
                });
            }
        });

        return Array.from(grouped.values())
            .sort(
                (a, b) =>
                    new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime()
            )
            .map(({ awardedByNames, activityTitles, ...rest }) => ({
                badgeId: rest.badgeId,
                badgeName: rest.badgeName,
                badgeIcon: rest.badgeIcon,
                badgeColor: rest.badgeColor,
                description: rest.description,
                count: rest.count,
                awardedByNames: Array.from(awardedByNames),
                activityTitles: Array.from(activityTitles),
                notes: rest.notes,
            }));
    }, [badges]);

    // Hooks auxiliares: CEP e Autocomplete
    const cep = useCep();
    const courses = useCourses();
    const universities = useUniversities();

    // Hook de formulário com validação
    const form = useForm<ProfileData>({
        initialValues: {
            name: user.name || '',
            email: user.email,
            telefone: user.telefone || '',
            endereco: user.endereco || '',
            cidade: user.cidade || '',
            estado: user.estado || '',
            cep: user.cep || '',
            curso: user.curso || '',
            universidade: user.universidade || '',
            periodo: user.periodo || '',
            nomeEmpresa: user.nomeEmpresa || '',
            cargo: user.cargo || '',
            setor: user.setor || '',
            nomeUniversidade: user.nomeUniversidade || '',
            departamento: user.departamento || '',
            cargoGestor: user.cargoGestor || '',
            aboutMe: user.aboutMe || '',
            experiences: (user.experiences || []).map((e) => ({
                company: e.company,
                role: e.role,
                details: (e as any).details || '',
                startDate: typeof e.startDate === 'string' ? e.startDate : new Date(e.startDate).toISOString().slice(0, 10),
                endDate: e.endDate ? (typeof e.endDate === 'string' ? e.endDate : new Date(e.endDate).toISOString().slice(0, 10)) : '',
            })),
        },
        validationSchema: profileSchema,
        onSuccess: () => {
            showSuccess('Perfil atualizado com sucesso!');
        },
        onError: (error) => showError(error || 'Erro ao atualizar perfil')
    });

    // Estado para dados do formulário (compatibilidade)
    const [formData, setFormData] = useState<ProfileData>(form.values);

    // Hook para atualização do perfil
    const updateProfileApi = useApi({
        onSuccess: () => {
            showSuccess('Perfil atualizado com sucesso!');
        },
        onError: (error) => showError(error || 'Erro ao atualizar perfil')
    });

    // Hook para upload de imagem
    const uploadImageApi = useApi({
        onSuccess: (data) => {
            showSuccess('Imagem atualizada com sucesso!');
            // Recarregar a página para mostrar a nova imagem
            window.location.reload();
        },
        onError: (error) => showError(error || 'Erro ao fazer upload da imagem')
    });

    // Função para mostrar toast
    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    // Função para atualizar dados
    const updateProfile = async (data: ProfileData) => {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar perfil');
        }

        return response.json();
    };

    const handleSubmit = async (values: ProfileData) => {
        // Se há imagem selecionada, fazer upload primeiro
        let imageUrl = user.image;
        if (selectedImage) {
            const formDataImage = new FormData();
            formDataImage.append('image', selectedImage);

            const uploadSuccess = await uploadImageApi.execute(() =>
                fetch('/api/profile/upload-image', {
                    method: 'POST',
                    body: formDataImage,
                }).then(res => res.json())
            );

            if (uploadSuccess) {
                // A função onSuccess do uploadImageApi já recarrega a página
                return;
            }
        }

        // Atualizar perfil com dados
        updateProfileApi.execute(() =>
            fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    image: imageUrl || undefined
                }),
            }).then(async (res) => {
                const payload = await res.json().catch(() => null);
                if (!res.ok) {
                    const message = (payload && (payload.error || payload.message)) || 'Erro ao atualizar perfil';
                    throw new Error(message);
                }
                return payload;
            })
        );

        // Limpar estado da imagem após sucesso
        setSelectedImage(null);
        setImagePreview(null);
    };

    // Wrapper para compatibilidade
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = form.validate();
        if (!isValid) {
            showError('Corrija os campos destacados');
            return;
        }
        await handleSubmit(form.values);
    };

    const handleInputChange = (field: string, value: string) => {
        let newValue = value;

        if (field === 'telefone') {
            const digits = value.replace(/\D/g, '').slice(0, 11);
            newValue = validationUtils.formatPhone(digits);
        }
        if (field === 'estado') {
            newValue = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [field]: newValue }));
        // Sincronizar também com o useForm para validação/envio corretos
        form.setFieldValue(field as any, newValue);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addExperience = () => {
        const list = [...(form.values.experiences || [])];
        if (list.length >= 20) {
            showError('Máximo de 20 experiências');
            return;
        }
        list.push({ company: '', role: '', startDate: '', endDate: '' });
        form.setFieldValue('experiences' as any, list as any);
        setFormData(prev => ({ ...prev, experiences: list as any }));
    };

    const removeExperience = (index: number) => {
        const list = [...(form.values.experiences || [])];
        list.splice(index, 1);
        form.setFieldValue('experiences' as any, list as any);
        setFormData(prev => ({ ...prev, experiences: list as any }));
    };

    const updateExperience = (index: number, field: 'company' | 'role' | 'startDate' | 'endDate' | 'details', value: string) => {
        const list = [...(form.values.experiences || [])];
        list[index] = { ...list[index], [field]: value } as any;
        form.setFieldValue('experiences' as any, list as any);
        setFormData(prev => ({ ...prev, experiences: list as any }));
    };

    const toggleExpanded = (index: number) => {
        setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamanho (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToastMessage('Imagem deve ter no máximo 5MB', 'error');
                return;
            }

            // Validar tipo
            if (!file.type.startsWith('image/')) {
                showToastMessage('Por favor, selecione uma imagem válida', 'error');
                return;
            }

            setSelectedImage(file);

            // Criar preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Renderizar campos específicos baseado no tipo de usuário
    const renderSpecificFields = () => {
        switch (user.userType) {
            case 'aluno':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Informações Acadêmicas
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Curso</label>
                                <AutocompleteInput
                                    value={formData.curso || ''}
                                    onChange={(v) => handleInputChange('curso', v)}
                                    onSearch={courses.searchCourses}
                                    suggestions={courses.courses}
                                    placeholder="Ex: Engenharia de Software"
                                    fieldType="course"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Universidade</label>
                                <AutocompleteInput
                                    value={formData.universidade || ''}
                                    onChange={(v) => handleInputChange('universidade', v)}
                                    onSearch={universities.searchUniversities}
                                    suggestions={universities.universities}
                                    placeholder="Ex: Universidade Federal"
                                    fieldType="university"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Período/Semestre</label>
                                <select
                                    value={formData.periodo || ''}
                                    onChange={(e) => handleInputChange('periodo', e.target.value)}
                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                >
                                    <option value="">Selecione o período</option>
                                    {Array.from({ length: 12 }, (_, i) => `${i + 1}`).map((p) => (
                                        <option key={p} value={p}>{p}º Período</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 'recrutador':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            Informações Profissionais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Nome da Empresa</label>
                                <input
                                    type="text"
                                    value={formData.nomeEmpresa}
                                    onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                                    placeholder="Ex: Tech Solutions Ltda"
                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.cargo}
                                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                                    placeholder="Ex: Recrutador Sênior"
                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Setor</label>
                                <input
                                    type="text"
                                    value={formData.setor}
                                    onChange={(e) => handleInputChange('setor', e.target.value)}
                                    placeholder="Ex: Tecnologia da Informação"
                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'gestor':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            Informações Institucionais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Nome da Universidade</label>
                                <input
                                    type="text"
                                    value={formData.nomeUniversidade}
                                    onChange={(e) => handleInputChange('nomeUniversidade', e.target.value)}
                                    placeholder="Ex: Universidade Federal"
                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Departamento</label>
                                <input
                                    type="text"
                                    value={formData.departamento}
                                    onChange={(e) => handleInputChange('departamento', e.target.value)}
                                    placeholder="Ex: Departamento de TI"
                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.cargoGestor}
                                    onChange={(e) => handleInputChange('cargoGestor', e.target.value)}
                                    placeholder="Ex: Coordenador"
                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            {/* Toast Notification */}
            <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}>
                <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toastType === 'success' ?
                        <CheckCircle className="h-5 w-5" /> :
                        <XCircle className="h-5 w-5" />
                    }
                    {toastMessage}
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-8">
                {/* Informações Básicas */}
                <div className={`${cardStyles.base} ${cardStyles.padding}`}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informações Básicas
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Foto de Perfil */}
                        <div className="flex flex-col items-center justify-start space-y-4">
                            <label className="text-gray-700 font-semibold flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Foto de Perfil
                            </label>
                            <div className="text-black flex flex-col items-center space-y-3">
                                -MANUTENÇÃO-
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : user.image ? (
                                            <img
                                                src={user.image}
                                                alt="Perfil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-16 h-16 text-white" />
                                        )}
                                    </div>
                                    {/* <label
                                        htmlFor="image-upload"
                                        className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg"
                                    >
                                        <Upload className="w-4 h-4" />
                                    </label>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    /> */}
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    PNG, JPG até 5MB
                                </p>
                            </div>

                            {/* Medalhas (apenas para alunos) */}
                            {user.userType === 'aluno' && (
                                <div className="space-y-2 w-full">
                                    <label className="text-gray-700 font-semibold flex items-center gap-2 justify-center">
                                        <Award className="w-4 h-4" />
                                        Medalhas
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                                        {/* Medalha de Ouro */}
                                        <div className="px-2 py-2 border rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-center">
                                            <div className="text-xl mb-1">🥇</div>
                                            <div className="text-sm font-bold text-yellow-800">
                                                {user.goldMedals || 0}
                                            </div>
                                            <div className="text-xs text-yellow-600">
                                                Ouro
                                            </div>
                                        </div>

                                        {/* Medalha de Prata */}
                                        <div className="px-2 py-2 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-center">
                                            <div className="text-xl mb-1">🥈</div>
                                            <div className="text-sm font-bold text-gray-800">
                                                {user.silverMedals || 0}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Prata
                                            </div>
                                        </div>

                                        {/* Medalha de Bronze */}
                                        <div className="px-2 py-2 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-center">
                                            <div className="text-xl mb-1">🥉</div>
                                            <div className="text-sm font-bold text-orange-800">
                                                {user.bronzeMedals || 0}
                                            </div>
                                            <div className="text-xs text-orange-600">
                                                Bronze
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">Medalhas por participação e desempenho</p>
                                </div>
                            )}

                            {/* Emblemas recebidos */}
                            <div className="space-y-2 w-full">
                                <label className="text-gray-700 font-semibold flex items-center gap-2 justify-center">
                                    <BadgeCheck className="w-4 h-4" />
                                    Emblemas recebidos
                                </label>
                                {aggregatedBadges.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {aggregatedBadges.map((badge) => {
                                            const tooltip = [
                                                badge.description,
                                                `Recebido ${badge.count} ${badge.count > 1 ? 'vezes' : 'vez'}`,
                                                badge.awardedByNames.length
                                                    ? `Concedido por: ${badge.awardedByNames.join(', ')}`
                                                    : null,
                                                badge.activityTitles.length
                                                    ? `Atividades: ${badge.activityTitles.join(', ')}`
                                                    : null,
                                                badge.notes.length
                                                    ? `Mensagens: ${badge.notes.join(' | ')}`
                                                    : null,
                                            ]
                                                .filter(Boolean)
                                                .join(' • ');

                                            return (
                                                <span
                                                    key={badge.badgeId}
                                                    title={tooltip || 'Emblema conquistado'}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium bg-white"
                                                    style={{
                                                        borderColor: badge.badgeColor || '#c4b5fd',
                                                        color: badge.badgeColor || '#6b21a8',
                                                    }}
                                                >
                                                    <span>{badge.badgeIcon || '🏅'}</span>
                                                    <span>
                                                        {badge.badgeName}
                                                        {badge.count > 1 ? ` ×${badge.count}` : ''}
                                                    </span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 text-center">
                                        Nenhum emblema recebido ainda.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Campos de Texto */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-gray-700 font-semibold block">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Seu nome completo"
                                        className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${form.errors.name
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-purple-500'
                                            }`}
                                    />
                                    {form.errors.name && (
                                        <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-gray-700 font-semibold flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-gray-700 font-semibold flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telefone}
                                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                                        placeholder="(11) 99999-9999"
                                        maxLength={15}
                                        className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${form.errors.telefone
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-purple-500'
                                            }`}
                                    />
                                    {form.errors.telefone && (
                                        <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {form.errors.telefone}
                                        </p>
                                    )}
                                </div>

                                {user.cpf && (
                                    <div className="space-y-2">
                                        <label className="text-gray-700 font-semibold block">CPF</label>
                                        <input
                                            type="cpf"
                                            value={user.cpf}
                                            disabled
                                            className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500">O CPF não pode ser alterado</p>
                                    </div>
                                )}

                                {user.cnpj && (
                                    <div className="space-y-2">
                                        <label className="text-gray-700 font-semibold block">CNPJ</label>
                                        <input
                                            type="cnpj"
                                            value={user.cnpj}
                                            disabled
                                            className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500">O CNPJ não pode ser alterado</p>
                                    </div>
                                )}


                            </div>
                        </div>
                    </div>
                </div>

                {/* Informações de Endereço */}
                <div className={`${cardStyles.base} ${cardStyles.padding}`}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Endereço
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-gray-700 font-semibold block">Endereço</label>
                            <input
                                type="text"
                                value={formData.endereco}
                                onChange={(e) => handleInputChange('endereco', e.target.value)}
                                placeholder="Rua, número, bairro"
                                className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.endereco
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-purple-500'
                                    }`}
                            />
                            {form.errors.endereco && (
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {form.errors.endereco}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Cidade</label>
                                <input
                                    type="text"
                                    value={formData.cidade}
                                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                                    placeholder="Sua cidade"
                                    className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${form.errors.cidade
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                />
                                {form.errors.cidade && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.cidade}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Estado</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange('estado', e.target.value)}
                                    className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duração-300 ${form.errors.estado
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                >
                                    <option value="">Selecione o estado</option>
                                    {UF_OPTIONS.map((uf) => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                                {form.errors.estado && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.estado}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">CEP</label>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={formData.cep}
                                        onChange={(e) => handleInputChange('cep', e.target.value)}
                                        onBlur={async () => {
                                            const cepDigits = (form.values.cep || '').replace(/\D/g, '');
                                            if (cepDigits.length === 8) {
                                                const data = await cep.searchCep(cepDigits);
                                                if (data) {
                                                    form.setFieldValue('cidade', data.localidade);
                                                    form.setFieldValue('estado', data.uf);
                                                    setFormData(prev => ({ ...prev, cidade: data.localidade, estado: data.uf }));
                                                }
                                            }
                                        }}
                                        placeholder="00000-000"
                                        className={`text-black w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duração-300 ${form.errors.cep
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-purple-500'
                                            }`}
                                    />
                                    {cep.loading && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                        </div>
                                    )}
                                </div>
                                {cep.error && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {cep.error}
                                    </p>
                                )}
                                {form.errors.cep && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.cep}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sobre mim (aluno e gestor) */}
                {(user.userType === 'aluno' || user.userType === 'gestor') && (
                    <div className={`${cardStyles.base} ${cardStyles.padding}`}>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Sobre mim
                        </h2>
                        <div className="space-y-2">
                            <textarea
                                value={form.values.aboutMe || ''}
                                onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                                placeholder="Conte um pouco sobre você, objetivos, conquistas..."
                                maxLength={1000}
                                rows={5}
                                className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${form.errors.aboutMe
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-purple-500'
                                    }`}
                            />
                            <div className="text-xs text-gray-500 text-right">{(form.values.aboutMe?.length || 0)}/1000</div>
                            {form.errors.aboutMe && (
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {form.errors.aboutMe}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Experiências (aluno e gestor) */}
                {(user.userType === 'aluno' || user.userType === 'gestor') && (
                    <div className={`${cardStyles.base} ${cardStyles.padding}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Experiências
                            </h2>
                            <button type="button" onClick={addExperience} className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-sm">Adicionar</button>
                        </div>

                        {(form.values.experiences || []).length === 0 && (
                            <p className="text-sm text-gray-600">Nenhuma experiência adicionada.</p>
                        )}

                        <div className="space-y-4">
                            {(form.values.experiences || []).map((exp, idx) => (
                                <div key={idx} className="p-4 border rounded-lg bg-white">
                                    {/* Header compacto sempre visível */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-900 font-medium">
                                            {exp.role || 'Função não informada'} • {exp.company || 'Empresa não informada'}
                                        </div>
                                        <button type="button" onClick={() => toggleExpanded(idx)} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                            {expanded[idx] ? (
                                                <>
                                                    Recolher <ChevronUp className="w-4 h-4" />
                                                </>
                                            ) : (
                                                <>
                                                    Expandir <ChevronDown className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {expanded[idx] && (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-gray-700 font-semibold block">Empresa</label>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                                    className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${form.errors[`experiences.${idx}.company` as any]
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-purple-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-gray-700 font-semibold block">Função</label>
                                                <input
                                                    type="text"
                                                    value={exp.role}
                                                    onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                                    className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${form.errors[`experiences.${idx}.role` as any]
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-purple-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-gray-700 font-semibold block">Detalhes</label>
                                                <textarea
                                                    value={(exp as any).details || ''}
                                                    onChange={(e) => updateExperience(idx, 'details', e.target.value)}
                                                    placeholder="Descrição das atividades, tecnologias, conquistas..."
                                                    maxLength={1000}
                                                    rows={3}
                                                    className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${form.errors[`experiences.${idx}.details` as any]
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-purple-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-gray-700 font-semibold block">Início</label>
                                                <input
                                                    type="date"
                                                    value={exp.startDate as string}
                                                    onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-gray-700 font-semibold block">Fim (opcional)</label>
                                                <input
                                                    type="date"
                                                    value={(exp.endDate as string) || ''}
                                                    onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                                                    className="text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2 mt-2 text-right">
                                                <button type="button" onClick={() => removeExperience(idx)} className="text-sm text-red-600 hover:text-red-700">Remover</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Campos específicos por tipo de usuário */}
                {renderSpecificFields()}

                {/* Botão de Salvar */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateProfileApi.loading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        {updateProfileApi.loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
