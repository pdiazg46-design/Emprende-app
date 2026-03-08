import { Suspense } from "react"
import GastosClient from "./GastosClient"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DesktopLayout } from "@/components/layout/DesktopLayout"

export const dynamic = 'force-dynamic'

export default async function ExpensesPage({
    searchParams
}: {
    searchParams: { timeframe?: string }
}) {
    const session = await auth()
    if (!session?.user) {
        redirect("/signin")
    }

    const isPro = (session.user as any)?.subscriptionPlan === 'PRO'
    const timeframe = searchParams.timeframe || 'month' 

    return (
        <DesktopLayout user={session.user}>
            <Suspense fallback={<div className="p-10 text-center">Cargando control de gastos...</div>}>
                <GastosClient initialTimeframe={timeframe} isPro={isPro} />
            </Suspense>
        </DesktopLayout>
    )
}
