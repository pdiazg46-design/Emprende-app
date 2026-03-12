import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import crypto from "crypto"

export const dynamic = 'force-dynamic'

function encryptToken(payload: any): string {
    const algorithm = 'aes-256-cbc';
    // Use NEXTAUTH_SECRET as a secure shared key between the two apps.
    // If not set, use a fallback (not recommended for production, but ensures it runs).
    const secretKey = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-that-is-at-least-32-chars';
    
    // Create a 32-byte key from the secret
    const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32);
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv and encrypted content separated by colon
    return `${iv.toString('hex')}:${encrypted}`;
}

export default async function EcommerceSSOPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/signin");
    }

    const { id, email, ecommerceActive, role } = session.user as any;

    // Check if the user is authorized to use E-commerce
    if (!ecommerceActive && role !== 'ADMIN') {
        // Redirigimos al catálogo/paywall si no tiene el módulo
        redirect("/emprende/planes?upgrade=ecommerce");
    }

    // SSO Payload: user details + an expiration timestamp (e.g., 60 seconds from now)
    const payload = {
        userId: id,
        email: email,
        exp: Date.now() + 60 * 1000 // 1 minute expiration to prevent replay attacks
    }

    const encryptedToken = encryptToken(payload);

    // Get the destination URL.
    // Use an environment variable, fallback to the production URL to ensure SSO works out of the box.
    const ecommerceBaseUrl = process.env.NEXT_PUBLIC_ECOMMERCE_URL || 'https://ecommerce-emprende.vercel.app';
    
    // Construct the SSO redirect URL
    const destinationUrl = `${ecommerceBaseUrl}/api/sso-login?token=${encodeURIComponent(encryptedToken)}`;

    // Perform the automatic redirect to log the user in
    redirect(destinationUrl);
}
