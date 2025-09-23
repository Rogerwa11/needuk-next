'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
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
    Upload
} from 'lucide-react';

// Schema para validação dos dados de perfil
const profileSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    telefone: z.string().min(14, 'Telefone é obrigatório'),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    cep: z.string().min(9, 'CEP é obrigatório'),
    // Campos específicos
    curso: z.string().optional(),
    universidade: z.string().optional(),
    periodo: z.string().optional(),
    nomeEmpresa: z.string().optional(),
    cargo: z.string().optional(),
    setor: z.string().optional(),
    nomeUniversidade: z.string().optional(),
    departamento: z.string().optional(),
    cargoGestor: z.string().optional(),
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

    const [formData, setFormData] = useState<ProfileData>({
        name: user.name || '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            profileSchema.parse(formData);
            setErrors({});
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.issues.forEach((err) => {
                    if (err.path.length > 0) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return;
        }

        setLoading(true);

        try {
            // Se há imagem selecionada, fazer upload primeiro
            let imageUrl = user.image;
            if (selectedImage) {
                const formDataImage = new FormData();
                formDataImage.append('image', selectedImage);

                const uploadResponse = await fetch('/api/profile/upload-image', {
                    method: 'POST',
                    body: formDataImage,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Erro ao fazer upload da imagem');
                }

                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.imageUrl;
            }

            // Atualizar perfil com dados + imagem
            await updateProfile({
                ...formData,
                image: imageUrl || undefined
            });

            showToastMessage('Perfil atualizado com sucesso!', 'success');
            // Limpar estado da imagem
            setSelectedImage(null);
            setImagePreview(null);
            // Recarregar a página para mostrar os dados atualizados
            setTimeout(() => {
                router.refresh();
            }, 1000);
        } catch (error) {
            showToastMessage('Erro ao atualizar perfil. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
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
                                <input
                                    type="text"
                                    value={formData.curso}
                                    onChange={(e) => handleInputChange('curso', e.target.value)}
                                    placeholder="Ex: Engenharia de Software"
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Universidade</label>
                                <input
                                    type="text"
                                    value={formData.universidade}
                                    onChange={(e) => handleInputChange('universidade', e.target.value)}
                                    placeholder="Ex: Universidade Federal"
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Período/Semestre</label>
                                <input
                                    type="text"
                                    value={formData.periodo}
                                    onChange={(e) => handleInputChange('periodo', e.target.value)}
                                    placeholder="Ex: 5º período"
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
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
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.cargo}
                                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                                    placeholder="Ex: Recrutador Sênior"
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Setor</label>
                                <input
                                    type="text"
                                    value={formData.setor}
                                    onChange={(e) => handleInputChange('setor', e.target.value)}
                                    placeholder="Ex: Tecnologia da Informação"
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
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
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Departamento</label>
                                <input
                                    type="text"
                                    value={formData.departamento}
                                    onChange={(e) => handleInputChange('departamento', e.target.value)}
                                    placeholder="Ex: Departamento de TI"
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.cargoGestor}
                                    onChange={(e) => handleInputChange('cargoGestor', e.target.value)}
                                    placeholder="Ex: Coordenador"
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações Básicas */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
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
                            <div className="flex flex-col items-center space-y-3">
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
                                    <label
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
                                    />
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    PNG, JPG até 5MB
                                </p>
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
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.name
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-purple-500'
                                            }`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.name}
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
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.telefone
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-purple-500'
                                            }`}
                                    />
                                    {errors.telefone && (
                                        <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.telefone}
                                        </p>
                                    )}
                                </div>

                                {user.userType === 'aluno' && (
                                    <div className="space-y-2">
                                        <label className="text-gray-700 font-semibold block">CPF</label>
                                        <input
                                            type="text"
                                            value={user.cpf || ''}
                                            readOnly
                                            className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500">O CPF não pode ser alterado</p>
                                    </div>
                                )}

                                {(user.userType === 'recrutador' || user.userType === 'gestor') && (
                                    <div className="space-y-2">
                                        <label className="text-gray-700 font-semibold block">CNPJ</label>
                                        <input
                                            type="text"
                                            value={user.cnpj || ''}
                                            readOnly
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
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
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
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.endereco
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-purple-500'
                                    }`}
                            />
                            {errors.endereco && (
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.endereco}
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
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.cidade
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                />
                                {errors.cidade && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.cidade}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">Estado</label>
                                <input
                                    type="text"
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange('estado', e.target.value)}
                                    placeholder="UF"
                                    maxLength={2}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.estado
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                />
                                {errors.estado && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.estado}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-700 font-semibold block">CEP</label>
                                <input
                                    type="text"
                                    value={formData.cep}
                                    onChange={(e) => handleInputChange('cep', e.target.value)}
                                    placeholder="00000-000"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.cep
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-purple-500'
                                        }`}
                                />
                                {errors.cep && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.cep}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Campos específicos por tipo de usuário */}
                {renderSpecificFields()}

                {/* Botão de Salvar */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        {loading ? (
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
