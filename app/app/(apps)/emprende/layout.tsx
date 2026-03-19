import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { FairSyncer } from "@/components/pos/FairSyncer"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const userDb = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { activeFair: true }
    });

    // 2. Check Subscription Status (Skip for ADMIN)
    const role = (session.user as any).role
    const subscriptionPlan = (session.user as any).subscriptionPlan
    const subscriptionStatus = (session.user as any).subscriptionStatus
    const trialStartsAt = (session.user as any).trialStartsAt || (session.user as any).createdAt

    // Admin passes always
    if (role !== 'ADMIN') {

        // Trial Validation Logic (30 days lock)
        if (subscriptionPlan === 'BASIC' && subscriptionStatus !== 'ACTIVE') {
            const startDate = new Date(trialStartsAt)
            const today = new Date()
            const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

            if (daysSinceStart > 30) {
                redirect("/emprende/premium-mobile")
            }
        }

        // Existing Expiration Check
        if (subscriptionStatus !== 'ACTIVE' && subscriptionStatus !== 'TRIAL') {
            // Usually we only redirect to expired if they aren't caught by the Mobile Paywall.
            // But let's keep the older logic just in case for other statuses.
            redirect("/subscription-expired")
        }
    }

    return (
        <>
            <FairSyncer activeFairFromDB={userDb?.activeFair || null} />
            {children}
        </>
    );
}
