import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function EmprendeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth()

    // 1. Check if user is authenticated
    if (!session?.user?.email) {
        redirect("/signin")
    }

    // 2. Check Subscription Status (Skip for ADMIN)
    const role = (session.user as any).role
    if (role !== 'ADMIN') {
        const status = (session.user as any).subscriptionStatus
        if (status !== 'ACTIVE' && status !== 'TRIAL') {
            redirect("/subscription-expired")
        }
    }

    return (
        <>
            {children}
        </>
    );
}
