import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo e Descrição */}
                    <div className="lg:col-span-1">
                        <h3 className="text-2xl font-bold mb-4">Needuk</h3>
                        <p className="text-gray-300 mb-4">
                            Conectando talentos universitários com oportunidades de estágio e emprego.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Rápidos */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/signup" className="text-gray-300 hover:text-white transition-colors">
                                    Cadastro
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Para Usuários */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Para Usuários</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Como Funciona
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Planos e Preços
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Central de Ajuda
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contato */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contato</h4>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-300">contato@needuk.com</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-300">(98) 99999-9999</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-300">São luís, MA</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linha Divisória */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-sm">
                            © 2024 Needuk. Todos os direitos reservados.
                        </div>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Política de Privacidade
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Termos de Uso
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
