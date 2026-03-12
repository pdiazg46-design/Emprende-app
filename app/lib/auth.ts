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

                const normalizedEmail = (credentials.email as string).toLowerCase().trim();

                const user = await prisma.user.findUnique({
                    where: { email: normalizedEmail }
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
                    subscriptionPlan: user.subscriptionPlan,
                    trialStartsAt: user.trialStartsAt
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
            // 1. Initial Sign-in hydration (Credentials Auth)
            if (user) {
                token.sub = user.id
                token.role = user.role
                token.subscriptionStatus = user.subscriptionStatus
                token.subscriptionPlan = user.subscriptionPlan
                token.trialStartsAt = user.trialStartsAt
            }

            // 2. Real-time DB sync for SaaS (Soluciona el problema de "Sesión Estancada" post-pago o regalo Admin)
            if (token.sub) {
                try {
                    const freshUser = await prisma.user.findUnique({
                        where: { id: token.sub as string },
                        select: { role: true, subscriptionStatus: true, subscriptionPlan: true, trialStartsAt: true }
                    })
                    if (freshUser) {
                        token.role = freshUser.role
                        token.subscriptionStatus = freshUser.subscriptionStatus
                        token.subscriptionPlan = freshUser.subscriptionPlan
                        token.trialStartsAt = freshUser.trialStartsAt
                    }
                } catch (e) {
                    // Silencioso en caso de desconexión breve, NextAuth retiene el token en memoria caché
                    console.error("JWT sync error:", e)
                }
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
                session.user.trialStartsAt = token.trialStartsAt
            }
            return session
        }
    },
    basePath: "/api/auth",
    trustHost: true,
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.AUTH_SECRET || "c17ea4e6-88a5-43ad-a8ee-df6c6b02fc47",
})
