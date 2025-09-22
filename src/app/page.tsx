'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useAuthRedirect } from '@/hooks/useAuth';
import { AuthLoadingScreen } from '@/app/_components/AuthLoadingScreen';
import { Logo } from '@/app/_components/logo';

export default function Home() {

  // Hook para redirecionar se já estiver logado
  const { loading: authLoading } = useAuthRedirect('/dashboard');

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Coluna Esquerda - Conteúdo */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            {/* Logo */}
            <Logo />

            {/* Título Principal */}
            <h1 className="text-black text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Mostre ao mundo o seu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                potencial
              </span>
              , venha com a gente!
            </h1>

            {/* Descrição */}
            <p className="text-gray-700 text-base md:text-lg mb-8 leading-relaxed">
              Faça seu cadastro e preencha os campos, venha demonstrar suas capacidades e competências.{' '}
              <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                Comece agora!
              </Link>
            </p>

            {/* Botão CTA */}
            <div className="mb-8">
              <Link href="/signup">
                <button className="cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Cadastre-se
                </button>
              </Link>
            </div>

            {/* Link Login */}
            <p className="text-gray-600">
              Já possui conta? Faça{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                Login
              </Link>
              .
            </p>

            {/* Termos */}
            <p className="text-xs text-gray-500 mt-8 leading-relaxed">
              Ao clicar em Cadastre-se, você aceita os{' '}
              <Link href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                Termos de Consentimento
              </Link>
              {' '}e{' '}
              <Link href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                Política de Privacidade
              </Link>
              {' '}da Needuk.
            </p>
          </div>

          {/* Coluna Direita - Imagem */}
          <div className="relative h-64 lg:h-auto bg-gradient-to-br from-gray-100 to-gray-200">
            {/* Placeholder da imagem - substitua com sua imagem real */}
            <Image
              src="/home/home_bg.jpg"
              alt="Equipe trabalhando em conjunto"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
