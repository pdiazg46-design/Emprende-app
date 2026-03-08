"use client"

import { useEffect, useState } from "react"
import { getDashboardMetrics, getExpenseInsights } from "@/actions/transaction-actions"
import { TrendingDown, ShoppingBag, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { ExpenseAnalyticsContainer } from "./ExpenseAnalyticsContainer"

export default function GastosClient({ 
    initialTimeframe, 
    isPro 
}: { 
    initialTimeframe: string, 
    isPro: boolean 
}) {
    const [metrics, setMetrics] = useState<any>(null)
    const [insights, setInsights] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    
    // Custom Timeframe State
    const [isCustomMode, setIsCustomMode] = useState(initialTimeframe.startsWith('custom_'))
    const [customStart, setCustomStart] = useState(() => {
        if (initialTimeframe.startsWith('custom_')) return initialTimeframe.split('_')[1]
        return ""
    })
    const [customEnd, setCustomEnd] = useState(() => {
        if (initialTimeframe.startsWith('custom_')) return initialTimeframe.split('_')[2]
        return ""
    })
    
    const router = useRouter()

    useEffect(() => {
        setIsCustomMode(initialTimeframe.startsWith('custom_'))
        loadData()
    }, [initialTimeframe]) // Reload when timeframe changes

    const loadData = async () => {
        setLoading(true)
        try {
            // Fetch both metric types simultaneously
            const [data, analyticsData] = await Promise.all([
                getDashboardMetrics(),
                getExpenseInsights(initialTimeframe)
            ])
            setMetrics(data)
            setInsights(analyticsData)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        if (val === 'custom') {
            setIsCustomMode(true)
        } else {
            setIsCustomMode(false)
            router.push(`/emprende/gastos?timeframe=${val}`)
            router.refresh()
        }
    }

    const applyCustomRange = () => {
        if (customStart && customEnd) {
            router.push(`/emprende/gastos?timeframe=custom_${customStart}_${customEnd}`)
            router.refresh()
        } else {
            alert("Por favor selecciona una fecha de inicio y fin para buscar.")
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando inteligencia de gastos...</div>

    const expenseTransactions = metrics?.transactionsToday?.filter((t: any) => t.type === 'EXPENSE') || []
    let totalExpensesToday = 0
    expenseTransactions.forEach((t: any) => {
        totalExpensesToday += t.amount
    })

    return (
        <div className="pb-24 space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Control de Gastos</h1>
                    <p className="text-sm font-bold text-slate-400">Tus salidas de dinero de hoy</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <select
                        value={isCustomMode ? 'custom' : initialTimeframe}
                        onChange={handleTimeframeChange}
                        className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:right_10px_center] bg-no-repeat pr-10"
                    >
                        <option value="week">Semana Actual</option>
                        <option value="prev_week">Semana Anterior</option>
                        <option value="month">Mes Actual</option>
                        <option value="prev_month">Mes Anterior</option>
                        <option value="year">Año Actual</option>
                        <option value="prev_year">Año Anterior</option>
                        <option value="custom">Rango Personalizado...</option>
                    </select>

                    {isCustomMode && (
                        <div className="flex animate-in slide-in-from-top-2 items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <input 
                                type="date" 
                                value={customStart}
                                onChange={e => setCustomStart(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 focus:outline-none focus:border-red-500"
                            />
                            <span className="text-slate-400 font-bold text-sm">a</span>
                            <input 
                                type="date" 
                                value={customEnd}
                                onChange={e => setCustomEnd(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 focus:outline-none focus:border-red-500"
                            />
                            <button 
                                onClick={applyCustomRange}
                                className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                            >
                                Filtrar
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Container Desktop PRO AI */}
            <ExpenseAnalyticsContainer insights={insights} isPro={isPro} timeframe={initialTimeframe} />

            {/* Detailed Stats Hoy (Always Visible to All) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gastado del Rango Seleccionado</p>
                    </div>
                    <p className="text-3xl font-black text-rose-600">${(insights?.totalExpenses || 0).toLocaleString('es-CL')}</p>
                </div>

                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio Diario del Rango Seleccionado</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">${(insights?.averageMonthly || 0).toLocaleString('es-CL')}</p>
                </div>
            </div>

            {/* Recent Expenses List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-black text-slate-800 text-lg">Últimos Gastos Registrados (Hoy)</h3>
                </div>

                {expenseTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm font-medium">
                        No hay gastos registrados hoy. ¡Bien hecho!
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {expenseTransactions.map((t: any) => (
                            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{t.description || "Gasto General"}</p>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">
                                            {new Date(t.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-rose-600 text-sm">
                                        -${t.amount.toLocaleString('es-CL')}
                                    </p>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-500 mt-1 inline-block">
                                        Gasto
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 text-center">
                <p className="text-amber-800 font-bold text-sm mb-2">💡 Tip Financiero</p>
                <p className="text-amber-600 text-xs leading-relaxed">
                    Registrar cada salida de dinero es la base de un negocio sano. Inclusive las compras pequeñas hormiga pueden destruir tus márgenes si no las mides.
                </p>
            </div>
        </div>
    )
}
