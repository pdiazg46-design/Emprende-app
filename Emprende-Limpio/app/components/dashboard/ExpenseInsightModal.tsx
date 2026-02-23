"use client"

import { useEffect, useState } from "react"
import { X, TrendingDown, Wallet, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { getExpenseInsights } from "@/actions/transaction-actions"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

interface ExpenseInsightModalProps {
    onClose: () => void
}

export function ExpenseInsightModal({ onClose }: ExpenseInsightModalProps) {
    const [insights, setInsights] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week')

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const data = await getExpenseInsights(timeframe)
            setInsights(data)
            setLoading(false)
        }
        load()
    }, [timeframe])

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 relative">

                {/* Header */}
                <div className="bg-rose-50 p-6 flex flex-col gap-4 border-b border-rose-100 z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-rose-100">
                                <TrendingDown className="w-6 h-6 text-rose-600" />
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

                    {/* Timeframe Selector */}
                    <div className="flex bg-rose-100/50 p-1 rounded-xl">
                        {(['week', 'month', 'year'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-300 ${timeframe === t
                                    ? 'bg-white text-rose-700 shadow-sm'
                                    : 'text-rose-400 hover:text-rose-600'
                                    }`}
                            >
                                {t === 'week' ? 'Semana' : t === 'month' ? 'Mes' : 'Año'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content - Scrollable Zone */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-24 space-y-8 scroll-smooth will-change-scroll">

                    {/* Chart Area */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-rose-400" />
                            Curva de Gastos ({timeframe === 'week' ? 'Esta Semana' : timeframe === 'month' ? 'Este Mes' : 'Este Año'})
                        </h4>

                        <div className="h-48 w-full">
                            {loading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-rose-200 animate-spin" />
                                </div>
                            ) : insights?.trend?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={insights.trend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                            dy={10}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl">
                                                            {payload[0].payload.label}: <span className="text-rose-400">${payload[0].value?.toLocaleString('es-CL')}</span>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#f43f5e"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTrend)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <TrendingDown className="w-8 h-8 opacity-20 mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-wider">No hay gastos</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KPIs Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br from-slate-400 to-transparent w-full h-full rounded-2xl pointer-events-none" />
                            <div className="flex items-center gap-2 mb-2 text-slate-400 relative z-10">
                                <Wallet className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Gasto Prom. Diario / Ticket</span>
                            </div>
                            {loading ? (
                                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                            ) : (
                                <p className="text-2xl font-black text-slate-800 relative z-10">
                                    ${insights?.averageMonthly?.toLocaleString('es-CL') || 0}
                                </p>
                            )}
                        </div>

                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 bg-gradient-to-br from-rose-400 to-transparent w-full h-full rounded-2xl pointer-events-none transform scale-110 group-hover:scale-125 transition-transform duration-500" />
                            <div className="flex items-center gap-2 mb-2 text-rose-500 relative z-10">
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Total Periodo</span>
                            </div>
                            {loading ? (
                                <div className="h-8 w-24 bg-rose-200/50 rounded animate-pulse" />
                            ) : (
                                <p className="text-3xl font-black text-rose-600 relative z-10 tracking-tight">
                                    ${insights?.totalExpenses?.toLocaleString('es-CL') || 0}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Top Categories */}
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            Top Salidas
                        </h4>
                        <div className="space-y-3">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-12 w-full bg-slate-50 rounded-xl animate-pulse" />
                                ))
                            ) : insights?.topCategories?.length > 0 ? (
                                insights.topCategories.map((cat: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-rose-100 transition-colors">
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
                                    Tu dinero está a salvo este periodo.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Expert Advice */}
                    {insights?.advice && !loading && (
                        <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-xl text-white transform transition-transform hover:scale-[1.02] duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

                            <div className="relative z-10">
                                <p className="text-sm md:text-base font-medium leading-relaxed text-slate-100">
                                    {insights.advice.split(':').map((part: string, index: number) => (
                                        <span key={index}>
                                            {index === 0 ? <strong className="text-rose-300 block mb-2 font-black uppercase tracking-widest text-xs flex items-center gap-2"><TrendingDown className="w-4 h-4" />{part}:</strong> : part}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
