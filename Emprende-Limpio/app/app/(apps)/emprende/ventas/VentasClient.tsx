"use client"

import { useEffect, useState } from "react"
import { getDashboardMetrics } from "@/actions/transaction-actions"
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, ShoppingBag } from "lucide-react"

export default function VentasClient() {
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

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando inteligencia de negocio...</div>

    // --- BI LOGIC: "EL SOCIO VIRTUAL" ---

    // 1. Calculate Real Profit (Revenue - Estimated Cost)
    // Note: This relies on current product cost. 
    let totalRevenue = 0
    let totalCost = 0

    // Filter only SALES from today's transactions
    const salesTransactions = metrics?.transactionsToday?.filter((t: any) => t.type === 'SALE') || []

    salesTransactions.forEach((t: any) => {
        totalRevenue += t.amount
        // Estimated Cost: Quantity * Product Cost (if available)
        const unitCost = t.product?.cost || 0
        totalCost += (t.quantity || 1) * unitCost
    })

    const totalProfit = totalRevenue - totalCost
    const marginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    // 2. Determine "Traffic Light" Status
    // Simple Heuristic: 
    // Green: Profit > $10.000 (Example Goal) AND Margin > 30%
    // Yellow: Profit > 0
    // Red: Profit <= 0 (Loss or No Sales)
    let status = 'neutral'
    let message = "Aún no hay suficientes datos hoy."
    let colorClass = "bg-slate-100 text-slate-600"

    if (salesTransactions.length === 0) {
        status = 'empty'
        message = "El día está comenzando. ¡Vamos por esa primera venta!"
        colorClass = "bg-slate-100 text-slate-500"
    } else if (totalProfit > 15000) { // Hardcoded Daily Goal: $15.000 profit
        status = 'success'
        message = "¡Excelente ritmo! Hoy tus ganancias cubren tus costos y generan riqueza."
        colorClass = "bg-emerald-100 text-emerald-800 border border-emerald-200"
    } else if (totalProfit > 0) {
        status = 'warning'
        message = "Estás en números azules, pero el volumen es bajo. Impulsa productos de alto margen."
        colorClass = "bg-yellow-50 text-yellow-800 border border-yellow-200"
    } else {
        status = 'danger'
        message = "Cuidado. Tus ventas apenas cubren los costos estimados. Revisa tus precios."
        colorClass = "bg-rose-100 text-rose-800 border border-rose-200"
    }

    return (
        <div className="pb-24 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ventas & Márgenes</h1>
                    <p className="text-sm font-bold text-slate-400">Inteligencia de Negocio</p>
                </div>
            </header>

            {/* "EL SOCIO VIRTUAL" INSIGHT CARD */}
            <div className={`p-6 rounded-[2rem] shadow-sm ${colorClass}`}>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/50 rounded-full backdrop-blur-sm shadow-sm">
                        {status === 'success' && <TrendingUp className="w-8 h-8 text-emerald-600" />}
                        {status === 'warning' && <AlertCircle className="w-8 h-8 text-yellow-600" />}
                        {status === 'danger' && <TrendingDown className="w-8 h-8 text-rose-600" />}
                        {status === 'empty' && <ShoppingBag className="w-8 h-8 text-slate-400" />}
                    </div>
                    <div>
                        <h2 className="text-lg font-black mb-1">Diagnóstico Diario</h2>
                        <p className="font-medium text-sm leading-relaxed opacity-90">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Mini Metrics Row in Card */}
                {status !== 'empty' && (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-white/40 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-xs font-bold uppercase opacity-60">Margen Real</p>
                            <p className="text-xl font-black">{marginPercent.toFixed(1)}%</p>
                        </div>
                        <div className="bg-white/40 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-xs font-bold uppercase opacity-60">Ganancia Pura</p>
                            <p className="text-xl font-black">${totalProfit.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Venta Total (Bruta)</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">${totalRevenue.toLocaleString('es-CL')}</p>
                </div>

                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Costo Estimado</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">${totalCost.toLocaleString('es-CL')}</p>
                </div>
            </div>

            {/* Recent Sales List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-black text-slate-800 text-lg">Ventas de Hoy</h3>
                </div>

                {salesTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No hay ventas registradas hoy.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {salesTransactions.map((t: any) => {
                            // Per-transaction Margin calculation
                            const tRevenue = t.amount
                            const tCost = (t.quantity || 1) * (t.product?.cost || 0)
                            const tProfit = tRevenue - tCost
                            const isPositive = tProfit > 0

                            return (
                                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                                            +{t.quantity || 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{t.description || "Venta General"}</p>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">
                                                {new Date(t.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-sm">
                                            ${t.amount.toLocaleString('es-CL')}
                                        </p>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {isPositive ? '+' : ''}${tProfit.toLocaleString('es-CL')}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">mg.</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center">
                <p className="text-blue-800 font-bold text-sm mb-2">💡 Tip de Inteligencia</p>
                <p className="text-blue-600 text-xs leading-relaxed">
                    Mantén actualizados los COSTOS en tu Inventario para que el cálculo de márgenes sea exacto.
                    Si un costo es $0, asumiré que es 100% ganancia (lo cual es riesgoso).
                </p>
            </div>
        </div>
    )
}
