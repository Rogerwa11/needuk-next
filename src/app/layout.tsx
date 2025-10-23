import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import "./globals.css";
import Footer from "./_components/footer";
import { AlertProvider, ConfirmProvider } from "@/components/ui";
import { AppLayout } from "./_components/app-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
  title: "Needuk - Plataforma de Conexão Profissional",
  description: "Needuk - Plataforma de Conexão Profissional",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "Needuk - Plataforma de Conexão Profissional",
    description: "Needuk - Plataforma de Conexão Profissional",
    images: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Verificar se o usuário está autenticado
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const isAuthenticated = !!session?.user;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AlertProvider>
          <ConfirmProvider>
            {isAuthenticated ? (
              // Usar AppLayout para usuários autenticados
              <AppLayout user={session.user}>
                {children}
              </AppLayout>
            ) : (
              // Layout normal para usuários não autenticados
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            )}
          </ConfirmProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
