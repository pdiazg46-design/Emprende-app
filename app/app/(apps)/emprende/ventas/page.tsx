import { Suspense } from "react"
import VentasClient from "./VentasClient"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DesktopLayout } from "@/components/layout/DesktopLayout"

export const dynamic = 'force-dynamic'

export default async function SalesPage({
    searchParams
}: {
    searchParams: Promise<{ timeframe?: string }>
}) {
    const session = await auth()
    if (!session?.user) {
        redirect("/signin")
    }

    const isPro = (session.user as any)?.subscriptionPlan === 'PRO'
    const sp = await searchParams;
    const timeframe = sp.timeframe || 'month' 

    return (
        <DesktopLayout user={session.user}>
            <Suspense fallback={<div className="p-10 text-center">Cargando métricas...</div>}>
                <VentasClient initialTimeframe={timeframe} isPro={isPro} />
            </Suspense>
        </DesktopLayout>
    )
}
