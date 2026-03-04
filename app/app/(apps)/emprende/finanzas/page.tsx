import { getFinanceInsights } from "@/actions/finance-actions"
import FinanceClient from "./FinanceClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function FinanzasPage(props: {
    searchParams: Promise<{ timeframe?: string }>
}) {
    const searchParams = await props.searchParams;
    const tf = (searchParams.timeframe as 'today' | 'week' | 'month' | 'last_month' | 'year' | 'last_year') || 'month';
    const insights = await getFinanceInsights(tf);

    if (!insights) {
        redirect("/emprende"); // Fallback si algo falla
    }

    return <FinanceClient initialData={insights} timeframe={tf} />;
}
