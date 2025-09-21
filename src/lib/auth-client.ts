import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_URL,
    plugins: [inferAdditionalFields<typeof auth>()]
})

// Exportar tipos para uso em outros arquivos
export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user