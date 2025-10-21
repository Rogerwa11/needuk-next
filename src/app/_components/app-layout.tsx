'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Briefcase,
    Users,
    Menu,
    X,
    User,
    LogOut,
    ChevronDown,
    Bell,
    Check,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { Logo } from '@/app/_components/logo';
import { ButtonSignout } from '@/app/dashboard/_components/button-signout';
import Footer from '@/app/_components/footer';
import { useApi } from '@/hooks/custom';

interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    userType: string;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    allowedUserTypes: string[];
}

const navigationItems: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        allowedUserTypes: ['aluno', 'recrutador', 'gestor']
    },
    {
        name: 'Atividades',
        href: '/activities',
        icon: BookOpen,
        allowedUserTypes: ['aluno', 'gestor']
    },
    {
        name: 'Vagas',
        href: '/vacancies',
        icon: Briefcase,
        allowedUserTypes: ['aluno', 'recrutador', 'gestor']
    },
    {
        name: 'Currículo/Relatório',
        href: '/curriculo',
        icon: FileText,
        allowedUserTypes: ['aluno', 'recrutador', 'gestor']
    },
    {
        name: 'Banco de Talentos',
        href: '/talentos',
        icon: Users,
        allowedUserTypes: ['recrutador', 'gestor']
    }
];

interface AppLayoutProps {
    children: React.ReactNode;
    user: User;
}

export const AppLayout = ({ children, user }: AppLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    // API hooks para notificações
    const fetchNotificationsApi = useApi({
        onSuccess: (data) => {
            const result = data.success ? data.data : data;
            setNotifications(result.notifications || []);
            setUnreadCount(result.unreadCount || 0);
        },
        onError: (error) => console.error('Erro ao buscar notificações:', error)
    });

    const markAsReadApi = useApi({
        onSuccess: (data) => {
            // A lógica de atualização do estado precisa ser feita na chamada
            // O notificationId não pode ser passado como parâmetro
        },
        onError: (error) => console.error('Erro ao marcar notificação:', error)
    });

    const respondToInvitationApi = useApi({
        onSuccess: (data) => {
            // Recarregar notificações após resposta
            fetchNotificationsApi.execute(() => fetch('/api/notifications').then(res => res.json()));
        },
        onError: (error) => console.error('Erro ao responder convite:', error)
    });

    // Buscar notificações
    const fetchNotifications = () => {
        fetchNotificationsApi.execute(() => fetch('/api/notifications').then(res => res.json()));
    };

    // Marcar notificação como lida
    const markAsRead = async (notificationId: string) => {
        const success = await markAsReadApi.execute(() =>
            fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            }).then(res => res.json())
        );

        if (success) {
            // Atualizar estado local após sucesso
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    // Responder convite
    const respondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
        const success = await respondToInvitationApi.execute(() =>
            fetch(`/api/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            }).then(res => res.json())
        );

        if (success) {
            // Fechar dropdown de notificações
            setNotificationsOpen(false);
        }
    };

    // Função helper para extrair ID do convite da mensagem
    const extractInvitationId = (message: string): string | null => {
        // Procura por padrão [invitation-id:ID] na mensagem
        const match = message.match(/\[invitation-id:([^\]]+)\]/);
        return match ? match[1] : null;
    };

    // Buscar notificações ao montar componente
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Filtrar itens de navegação baseado no tipo de usuário
    const filteredNavItems = navigationItems.filter(item =>
        item.allowedUserTypes.includes(user.userType)
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Sidebar para mobile - ultra compacta */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-40 bg-white shadow-xl border-r border-gray-200">
                    <CompactSidebarContent
                        items={filteredNavItems}
                        pathname={pathname}
                        onClose={() => setSidebarOpen(false)}
                    />
                </div>
            </div>

            {/* Sidebar para desktop - ultra compacta */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-40 bg-white shadow-lg border-r border-gray-200">
                <CompactSidebarContent items={filteredNavItems} pathname={pathname} />
            </div>

            {/* Conteúdo principal */}
            <div className="lg:ml-40 flex flex-col flex-1">
                {/* Header - mais compacto */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="flex items-center justify-between px-4 py-3">
                        {/* Botão do menu mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Espaçador para mobile */}
                        <div className="flex-1 lg:flex-none" />

                        {/* Botão de notificações e Menu do usuário */}
                        <div className="flex items-center space-x-2">
                            {/* Botão de Notificações */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setNotificationsOpen(!notificationsOpen);
                                        setUserMenuOpen(false);
                                    }}
                                    className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown de Notificações - compacto */}
                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
                                        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
                                            <button
                                                onClick={fetchNotifications}
                                                disabled={fetchNotificationsApi.loading}
                                                className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                                                title="Atualizar"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${fetchNotificationsApi.loading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>

                                        {(!notifications || notifications.length === 0) ? (
                                            <div className="px-3 py-4 text-center text-gray-500 text-xs">
                                                Nenhuma notificação
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {notifications?.slice(0, 5).map((notification) => {
                                                    const isInvitation = notification.type === 'invitation';
                                                    const invitationId = extractInvitationId(notification.message);

                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            className={`px-3 py-2 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                                                                } ${isInvitation ? 'border-l-2 border-l-purple-400' : ''}`}
                                                            onClick={() => !isInvitation && markAsRead(notification.id)}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-gray-900 truncate">
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                                        {notification.message.replace(/\[invitation-id:[^\]]+\]/, '').trim()}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Botões para convites - compactos */}
                                                            {isInvitation && invitationId && (
                                                                <div className="flex gap-1 mt-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            respondToInvitation(invitationId, 'accept');
                                                                        }}
                                                                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            respondToInvitation(invitationId, 'decline');
                                                                        }}
                                                                        className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                                                                    >
                                                                        ✗
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {notifications.length > 5 && (
                                            <div className="px-3 py-2 border-t border-gray-200 text-center">
                                                <span className="text-xs text-gray-500">
                                                    +{notifications.length - 5} mais notificações
                                                </span>
                                            </div>
                                        )}

                                        {notifications.length > 0 && (
                                            <div className="px-3 py-2 border-t border-gray-200">
                                                <button
                                                    onClick={() => {
                                                        // Marcar todas como lidas
                                                        notifications.forEach(notif => {
                                                            if (!notif.read) {
                                                                markAsRead(notif.id);
                                                            }
                                                        });
                                                    }}
                                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                                >
                                                    <Check className="w-3 h-3 inline mr-1" />
                                                    Marcar todas como lidas
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Menu do usuário - compacto */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(!userMenuOpen);
                                        setNotificationsOpen(false);
                                    }}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-xs font-medium text-gray-900 truncate max-w-24">
                                            {user.name || user.email.split('@')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {user.userType}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-3 h-3 text-gray-500" />
                                </button>

                                {/* Dropdown do usuário */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <Link
                                            href="/profile"
                                            className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <User className="w-3 h-3 mr-2" />
                                            Perfil
                                        </Link>
                                        <div className="border-t border-gray-100 my-1" />
                                        <ButtonSignout variant="dropdown" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Conteúdo da página */}
                <main className="flex-1">
                    {children}
                </main>

                {/* Footer - sempre no final */}
                <Footer />
            </div>

            {/* Overlay para fechar dropdowns quando clicar fora */}
            {(userMenuOpen || notificationsOpen) && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => {
                        setUserMenuOpen(false);
                        setNotificationsOpen(false);
                    }}
                />
            )}
        </div>
    );
};

// Componente ultra compacto do conteúdo da sidebar
const CompactSidebarContent = ({
    items,
    pathname,
    onClose
}: {
    items: NavItem[];
    pathname: string;
    onClose?: () => void;
}) => {
    return (
        <div className="flex flex-col h-full">
            {/* Header da sidebar - ultra compacto */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
                <div className="scale-50">
                    <Logo />
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Navegação - ultra compacta */}
            <nav className="flex-1 px-2 py-3 space-y-0.5">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center px-2 py-2 text-xs font-medium rounded-md transition-colors ${isActive
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                            <span className="text-[10px] leading-tight">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer da sidebar - ultra compacto */}
            <div className="p-2 border-t border-gray-200">
                <div className="text-[9px] text-gray-500 text-center leading-tight">
                    © 2025 Needuk
                </div>
            </div>
        </div>
    );
};
