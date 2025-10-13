import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Criar resposta de sucesso
        const response = NextResponse.json({
            success: true,
            message: "Logout realizado com sucesso"
        });

        // Limpar cookies de sessão para garantir que a sessão seja invalidada
        response.cookies.set("better-auth.session_token", "", {
            expires: new Date(0),
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        response.cookies.set("better-auth.refresh_token", "", {
            expires: new Date(0),
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return response;
    } catch (error) {
        console.error("Erro no logout:", error);
        return NextResponse.json(
            { error: "Erro ao fazer logout" },
            { status: 500 }
        );
    }
}
