import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email.toLowerCase().trim()
                    }
                })

                if (!user || !user.password) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name || user.email,
                    userType: user.userType,
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.userType = user.userType
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!
                session.user.userType = token.userType as string
            }
            return session
        },
        async signIn({ user, account, profile, email, credentials }) {
            return true
        },
        async redirect({ url, baseUrl }) {
            // Após login bem-sucedido, redirecionar para dashboard
            if (url === baseUrl) return `${baseUrl}/dashboard`
            // Se a URL é relativa, anexar ao baseUrl
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Se a URL pertence ao mesmo domínio, permitir
            else if (new URL(url).origin === baseUrl) return url
            // Caso contrário, redirecionar para dashboard
            return `${baseUrl}/dashboard`
        }
    },
    pages: {
        signIn: '/login',
        error: '/login', // Redirecionar erros para login
    },
    // Remover debug em produção para evitar warnings
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET,
}
