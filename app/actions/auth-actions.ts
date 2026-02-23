"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name) {
        return { error: "Todos los campos son obligatorios." };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "El correo electrónico ya está registrado." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER",
                subscriptionStatus: "TRIAL",
                subscriptionPlan: "BASIC"
            }
        });

        return { success: true };
    } catch (e: any) {
        console.error("Error Registration:", e);
        return { error: "Error interno del servidor. Intenta de nuevo." };
    }
}
