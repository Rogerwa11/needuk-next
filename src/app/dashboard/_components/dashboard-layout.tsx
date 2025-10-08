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
import { Logo } from '@/app/_components/logo';
import { ButtonSignout } from './button-signout';

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

interface DashboardLayoutProps {
    children: React.ReactNode;
    user: User;
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
        allowedUserTypes: ['aluno', 'recrutador', 'gestor']
    },
    {
        name: 'Currículo/Relatório',
        href: '/curriculo',
        icon: FileText,
        allowedUserTypes: ['aluno', 'recrutador', 'gestor']
    },
    {
        name: 'Vagas',
        href: '/vagas',
        icon: Briefcase,
        allowedUserTypes: ['aluno', 'recrutador', 'gestor']
    },
    {
        name: 'Banco de Talentos',
        href: '/talentos',
        icon: Users,
        allowedUserTypes: ['aluno', 'recrutador', 'gestor']
    }
];

export const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    // Buscar notificações
    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setNotifications(result.data.notifications || []);
                    setUnreadCount(result.data.unreadCount || 0);
                } else {
                    // Fallback para formato antigo
                    setNotifications(result.notifications || []);
                    setUnreadCount(result.unreadCount || 0);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        }
    };

    // Marcar notificação como lida
    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                // Atualizar estado local
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, read: true }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    };

    // Responder convite
    const respondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
        try {
            const response = await fetch(`/api/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                // Recarregar notificações
                await fetchNotifications();

                // Fechar dropdown de notificações
                setNotificationsOpen(false);
            } else {
                const errorData = await response.json();
                console.error('Erro ao responder convite:', errorData.error);
            }
        } catch (error) {
            console.error('Erro ao responder convite:', error);
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
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar para mobile */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
                    <SidebarContent
                        items={filteredNavItems}
                        pathname={pathname}
                        onClose={() => setSidebarOpen(false)}
                    />
                </div>
            </div>

            {/* Sidebar para desktop */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200">
                <SidebarContent items={filteredNavItems} pathname={pathname} />
            </div>

            {/* Conteúdo principal */}
            <div className="lg:ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="flex items-center justify-between px-4 py-4">
                        {/* Botão do menu mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo mobile */}
                        <div className="lg:hidden">
                            <Logo />
                        </div>

                        {/* Área central - Espaçador para mobile */}
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
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown de Notificações */}
                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
                                        </div>

                                        {(!notifications || notifications.length === 0) ? (
                                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                                Nenhuma notificação
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {notifications?.map((notification) => {
                                                    const isInvitation = notification.type === 'invitation';
                                                    const invitationId = extractInvitationId(notification.message);

                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                                                                } ${isInvitation ? 'border-l-4 border-l-purple-500' : ''}`}
                                                            onClick={() => !isInvitation && markAsRead(notification.id)}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </p>

                                                                    {/* Botões para convites */}
                                                                    {isInvitation && invitationId && (
                                                                        <div className="flex gap-2 mt-3">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    respondToInvitation(invitationId, 'accept');
                                                                                }}
                                                                                className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <CheckCircle className="w-3 h-3" />
                                                                                Aceitar
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    respondToInvitation(invitationId, 'decline');
                                                                                }}
                                                                                className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <XCircle className="w-3 h-3" />
                                                                                Recusar
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {!notification.read && !isInvitation && (
                                                                    <div className="ml-2 flex-shrink-0">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {notifications.length > 0 && (
                                            <div className="px-4 py-2 border-t border-gray-200">
                                                <button
                                                    onClick={() => {
                                                        // Marcar todas como lidas
                                                        notifications.forEach(notif => {
                                                            if (!notif.read) {
                                                                markAsRead(notif.id);
                                                            }
                                                        });
                                                    }}
                                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Marcar todas como lidas
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Menu do usuário */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(!userMenuOpen);
                                        setNotificationsOpen(false);
                                    }}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-white" />
                                        )}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.name || user.email}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {user.userType}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {/* Dropdown do usuário */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <Link
                                            href="/profile"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4 mr-3" />
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

// Componente do conteúdo da sidebar
const SidebarContent = ({
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
            {/* Header da sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Logo />
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navegação */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer da sidebar */}
            <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    © 2025 Needuk
                </div>
            </div>
        </div>
    );
};
