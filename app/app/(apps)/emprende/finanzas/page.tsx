import { getFinanceInsights } from "@/actions/finance-actions"
import FinanceClient from "./FinanceClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function FinanzasPage({
    searchParams
}: {
    searchParams: { timeframe?: string }
}) {
    const tf = (searchParams.timeframe as 'today' | 'week' | 'month' | 'year') || 'month';
    const insights = await getFinanceInsights(tf);

    if (!insights) {
        redirect("/emprende"); // Fallback si algo falla
    }

    return <FinanceClient initialData={insights} timeframe={tf} />;
}
