"use client"

import { useEffect, useState } from "react"
import { getDashboardMetrics } from "@/actions/transaction-actions"
import { TrendingDown, ShoppingBag, DollarSign } from "lucide-react"

export default function GastosClient() {
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await getDashboardMetrics()
            setMetrics(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando inteligencia de gastos...</div>

    const expenseTransactions = metrics?.transactionsToday?.filter((t: any) => t.type === 'EXPENSE') || []

    let totalExpensesToday = 0
    expenseTransactions.forEach((t: any) => {
        totalExpensesToday += t.amount
    })

    return (
        <div className="pb-24 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Control de Gastos</h1>
                    <p className="text-sm font-bold text-slate-400">Tus salidas de dinero de hoy</p>
                </div>
            </header>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gastos de Hoy</p>
                    </div>
                    <p className="text-3xl font-black text-rose-600">${totalExpensesToday.toLocaleString('es-CL')}</p>
                </div>

                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gastos de la Semana</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">${(metrics?.expensesThisWeek || 0).toLocaleString('es-CL')}</p>
                </div>
            </div>

            {/* Recent Expenses List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-black text-slate-800 text-lg">Gastos de Hoy</h3>
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
