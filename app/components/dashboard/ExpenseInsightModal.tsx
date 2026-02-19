"use client"

import { useEffect, useState } from "react"
import { X, TrendingDown, DollarSign, BrainCircuit, Wallet, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { getExpenseInsights } from "@/actions/transaction-actions"

interface ExpenseInsightModalProps {
    onClose: () => void
}

export function ExpenseInsightModal({ onClose }: ExpenseInsightModalProps) {
    const [insights, setInsights] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await getExpenseInsights()
            setInsights(data)
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-rose-50 p-6 flex items-center justify-between border-b border-rose-100 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-rose-100">
                            <BrainCircuit className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-rose-950 uppercase tracking-wide leading-none">
                                Control de Fugas
                            </h3>
                            <p className="text-xs font-bold text-rose-400 mt-1">
                                INTELIGENCIA DE GASTOS
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white rounded-full hover:bg-rose-100 text-rose-300 hover:text-rose-600 transition-colors shadow-sm border border-transparent hover:border-rose-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto pb-36">

                    {/* 1. KPIs Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <Wallet className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Prom. Mensual</span>
                            </div>
                            {loading ? (
                                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                            ) : (
                                <p className="text-2xl font-black text-slate-800">
                                    ${insights?.averageMonthly?.toLocaleString('es-CL') || 0}
                                </p>
                            )}
                        </div>

                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                            <div className="flex items-center gap-2 mb-2 text-rose-400">
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Total Histórico</span>
                            </div>
                            {loading ? (
                                <div className="h-8 w-24 bg-rose-200/50 rounded animate-pulse" />
                            ) : (
                                <p className="text-2xl font-black text-rose-600">
                                    ${insights?.totalExpenses?.toLocaleString('es-CL') || 0}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 2. Top Categories */}
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            Mayores Gastos
                        </h4>
                        <div className="space-y-3">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-12 w-full bg-slate-50 rounded-xl animate-pulse" />
                                ))
                            ) : insights?.topCategories?.length > 0 ? (
                                insights.topCategories.map((cat: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                                #{i + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm capitalize">{cat.name.toLowerCase()}</p>
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 w-24 overflow-hidden">
                                                    <div
                                                        className="h-full bg-rose-400 rounded-full"
                                                        style={{ width: `${(cat.value / insights.totalExpenses) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="font-black text-slate-900 text-sm">
                                            ${cat.value.toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-4">
                                    No hay gastos registrados aún.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3. Expert Advice */}
                    <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-xl text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 text-rose-300">
                                <BrainCircuit className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Análisis Experto</span>
                            </div>

                            {loading ? (
                                <div className="space-y-2">
                                    <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
                                </div>
                            ) : (
                                <p className="text-lg font-medium leading-relaxed text-slate-100">
                                    {insights?.advice}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
