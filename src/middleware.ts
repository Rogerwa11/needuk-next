import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const { pathname } = req.nextUrl

        // Rotas públicas que não devem ser acessadas quando logado
        const publicRoutes = ['/login', '/register', '/']

        // Rotas protegidas que precisam de autenticação
        const protectedRoutes = ['/dashboard']

        // Se está logado e tenta acessar rota pública, redireciona para dashboard
        if (token && publicRoutes.includes(pathname)) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // Se não está logado e tenta acessar rota protegida, redireciona para login
        if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
            const response = NextResponse.redirect(new URL('/login', req.url))
            // Limpar qualquer cookie de sessão que possa ter ficado
            response.cookies.delete('next-auth.session-token')
            response.cookies.delete('__Secure-next-auth.session-token')
            response.cookies.delete('next-auth.csrf-token')
            response.cookies.delete('__Host-next-auth.csrf-token')
            return response
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl

                // Sempre permitir acesso às rotas da API de auth
                if (pathname.startsWith('/api/auth')) {
                    return true
                }

                // Permitir acesso a assets estáticos
                if (pathname.startsWith('/_next') || pathname.includes('.')) {
                    return true
                }

                // Para rotas protegidas, verificar se tem token
                if (pathname.startsWith('/dashboard')) {
                    return !!token
                }

                // Para rotas públicas, sempre permitir (o middleware acima fará o redirect se necessário)
                return true
            },
        },
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (authentication endpoints)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)/',
    ],
}