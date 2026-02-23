import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Correo y Contraseña",
            credentials: {
                email: { label: "Correo", type: "email" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Ingresa correo y contraseña");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) {
                    throw new Error("Usuario no encontrado o no tiene contraseña configurada");
                }

                const isValid = await bcrypt.compare(credentials.password as string, user.password);

                if (!isValid) {
                    throw new Error("Contraseña incorrecta");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    subscriptionStatus: user.subscriptionStatus,
                    subscriptionPlan: user.subscriptionPlan
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }: any) {
            // El objeto "user" solo existe la primera vez que inicia sesión (cuando validó credenciales)
            if (user) {
                token.sub = user.id
                token.role = user.role
                token.subscriptionStatus = user.subscriptionStatus
                token.subscriptionPlan = user.subscriptionPlan
            }
            return token
        },
        async session({ session, token }: any) {
            // Re-hidratar la sesión con los datos persistidos en el token JWT
            if (session.user && token) {
                session.user.id = token.sub
                session.user.role = token.role
                session.user.subscriptionStatus = token.subscriptionStatus
                session.user.subscriptionPlan = token.subscriptionPlan
            }
            return session
        }
    },
    trustHost: true,
    debug: true,
    secret: process.env.AUTH_SECRET || "fallback-secret-emprende-prod-emergency-2026",
})
