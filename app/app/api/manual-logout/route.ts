import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const cookieStore = await cookies()
    const url = new URL("/auth/signin", request.url)
    const response = NextResponse.redirect(url)

    // Lista de cookies conocidas de Auth.js
    const authCookies = [
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "authjs.csrf-token",
        "next-auth.csrf-token",
        "next-auth.callback-url",
        "__Secure-next-auth.callback-url",
        "next-auth.state",
        "__Secure-next-auth.state",
        "next-auth.pkce.code_verifier",
        "__Secure-next-auth.pkce.code_verifier"
    ]

    // Borrado explícito
    authCookies.forEach((cookieName) => {
        response.cookies.delete(cookieName)
    })

    // Borrado agresivo de todo lo demás que parezca de auth
    cookieStore.getAll().forEach((cookie) => {
        if (cookie.name.includes("next-auth") || cookie.name.includes("authjs")) {
            response.cookies.delete(cookie.name)
        }
    })

    return response
}
