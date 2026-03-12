import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import crypto from "node:crypto"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

function encryptToken(payload: any): string | null {
    try {
        const algorithm = 'aes-256-cbc';
        const secretKey = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-key-that-is-at-least-32-chars';
        
        // Crear un Hash Base64 de la llave secreta para forzar 32 bytes exactos (Evita errores de padding en crypto)
        const hashStr = crypto.createHash('sha256').update(String(secretKey)).digest('hex').substring(0, 32);
        const keyBuffer = Buffer.from(hashStr, 'utf8');
        
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
        
        let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (e) {
        console.error("SSO Encryption Error:", e);
        return null; // Fallback graceful
    }
}

export default async function EcommerceSSOPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/signin");
    }

    const { id, email, role } = session.user as any;

    if (!id || !email) {
        redirect("/signin");
    }

    // Buscamos la data fresca directo a DB para evitar deshidratación de NextAuth Session
    const dbUser = await prisma.user.findUnique({
        where: { id },
        select: { ecommerceActive: true, role: true }
    });

    // Check if the user is authorized to use E-commerce
    if (!dbUser?.ecommerceActive && dbUser?.role !== 'ADMIN') {
        redirect("/emprende/planes?upgrade=ecommerce");
    }

    // SSO Payload
    const payload = {
        userId: id,
        email: email,
        exp: Date.now() + 60 * 1000 
    }

    const encryptedToken = encryptToken(payload);
    
    if (!encryptedToken) {
        // En caso de que el módulo criptográfico falle, abortamos y mostramos error amigable en POS
        return (
            <div className="flex flex-col items-center justify-center p-10 h-screen text-center">
                <h2 className="text-xl font-black text-rose-500 mb-4">Error de Seguridad SSO</h2>
                <p className="text-slate-600">No se pudo generar el token de traspaso seguro al E-Commerce. Intente nuevamente.</p>
            </div>
        )
    }

    const ecommerceBaseUrl = 'https://ecommerce-emprende.vercel.app';
    const destinationUrl = `${ecommerceBaseUrl}/api/sso-login?token=${encodeURIComponent(encryptedToken)}`;

    redirect(destinationUrl);
}
