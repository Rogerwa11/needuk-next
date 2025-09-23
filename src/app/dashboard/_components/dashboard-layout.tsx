'use client'

import { useState } from 'react';
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
    ChevronDown
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
        href: '/atividades',
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
    const pathname = usePathname();

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

                        {/* Menu do usuário */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
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
                </header>

                {/* Conteúdo da página */}
                <main className="flex-1">
                    {children}
                </main>
            </div>

            {/* Overlay para fechar dropdown quando clicar fora */}
            {userMenuOpen && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserMenuOpen(false)}
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
                    © 2024 Needuk
                </div>
            </div>
        </div>
    );
};
