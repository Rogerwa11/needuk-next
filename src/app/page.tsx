'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useAuthRedirect } from '@/hooks/useAuth';
import { AuthLoadingScreen } from '@/app/_components/AuthLoadingScreen';
import { Logo } from '@/app/_components/logo';

export default function Home() {

  const { user: user, loading: authLoading } = useAuthRedirect('/dashboard');

  if (authLoading || user) {
    return <AuthLoadingScreen />;
  }

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Coluna Esquerda - Conteúdo */}
            <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
              {/* Logo */}
              <Logo />

              {/* Título Principal */}
              <h1 className="text-black text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Mostre ao mundo o seu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  potencial
                </span>
                , venha com a gente!
              </h1>

              {/* Descrição */}
              <p className="text-gray-700 text-sm md:text-base mb-6 leading-relaxed">
                Faça seu cadastro e preencha os campos, venha demonstrar suas capacidades e competências.{' '}
                <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Comece agora!
                </Link>
              </p>

              {/* Botão CTA */}
              <div className="mb-6">
                <Link href="/signup">
                  <button className="cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-base hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
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
              <p className="text-xs text-gray-500 mt-6 leading-relaxed">
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
            <div className="relative h-48 lg:h-auto bg-gradient-to-br from-gray-100 to-gray-200">
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
}
