"use client"

import { useState, useEffect } from "react"
import { getSalesInsights } from "@/actions/transaction-actions"
import { X, TrendingUp, Clock, Award, DollarSign, BrainCircuit, Loader2, AlertCircle } from "lucide-react"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { cn } from "@/lib/utils"

interface InsightData {
    totalRevenue: number
    totalTransactions: number
    averageTicket: number
    topProducts: { name: string, quantity: number, revenue: number }[]
    peakHours: { hour: string, count: number, intensity: number }[]
    trend: { label: string, amount: number }[]
}

export function SalesInsightModal({ onClose }: { onClose: () => void }) {
    const [data, setData] = useState<InsightData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week')

    useEffect(() => {
        setLoading(true)
        getSalesInsights(timeframe)
            .then(res => {
                setData(res as InsightData)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [timeframe])

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-medium">Analizando historial...</p>
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Click Outside to Close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100">

                {/* Header (Sticky) */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 px-6 py-5 border-b border-slate-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <BrainCircuit className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Visión Experta</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Análisis de Inteligencia de Negocio</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 pb-36">

                    {/* Timeframe Selector (Pick List) */}
                    <div className="flex justify-center -mt-2">
                        <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
                            <button
                                onClick={() => setTimeframe('week')}
                                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", timeframe === 'week' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setTimeframe('month')}
                                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", timeframe === 'month' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Mes
                            </button>
                            <button
                                onClick={() => setTimeframe('year')}
                                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", timeframe === 'year' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Año
                            </button>
                        </div>
                    </div>

                    {/* GRÁFICO DE TENDENCIA (Dashboard Rápido) */}
                    <div className="animate-in fade-in duration-500">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Curva de Ventas {timeframe === 'week' ? '(Lun - Dom)' : timeframe === 'month' ? '(Actual)' : '(Ene - Dic)'}
                        </h3>
                        <div className="h-40 w-full bg-slate-50/50 rounded-2xl border border-slate-100 pt-4 pr-4 pb-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.trend}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                        dy={10}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`$${(value || 0).toLocaleString('es-CL')}`, 'Ventas']}
                                        labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '12px' }}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                                        itemStyle={{ color: '#0f172a', fontWeight: 'black', fontSize: '14px' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 1. KPIs Summary */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                        <div className="bg-emerald-50 p-3 md:p-4 rounded-2xl border border-emerald-100 flex flex-col justify-center overflow-hidden">
                            <div className="flex items-center gap-1.5 mb-1 text-emerald-700">
                                <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider truncate">Ticket Prom.</span>
                            </div>
                            <p className="text-xl md:text-2xl font-black text-slate-900 truncate">
                                ${data.averageTicket.toLocaleString('es-CL')}
                            </p>
                        </div>
                        <div className="bg-blue-50 p-3 md:p-4 rounded-2xl border border-blue-100 flex flex-col justify-center overflow-hidden">
                            <div className="flex items-center gap-1.5 mb-1 text-blue-700">
                                <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider truncate">Nº Ventas</span>
                            </div>
                            <p className="text-xl md:text-2xl font-black text-slate-900 truncate">
                                {data.totalTransactions}
                            </p>
                        </div>
                    </div>

                    {/* 2. Top Products (The Money Makers) */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            Productos Estrella
                        </h3>
                        <div className="space-y-3">
                            {data.topProducts.map((prod, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm group-hover:text-amber-600 transition-colors">
                                            {prod.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900">{prod.quantity} un.</p>
                                        <p className="text-[10px] text-slate-400 font-medium">${prod.revenue.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                            ))}
                            {data.topProducts.length === 0 && (
                                <p className="text-sm text-slate-400 italic">No hay suficientes datos de ventas aún.</p>
                            )}
                        </div>
                    </div>

                    {/* 3. Peak Hours (When to be ready) */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-violet-500" />
                            Horarios Punta
                        </h3>
                        {data.peakHours.length > 0 ? (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {data.peakHours.map((h, idx) => (
                                    <div key={idx} className="flex-shrink-0 bg-violet-50 border border-violet-100 px-4 py-3 rounded-2xl flex flex-col items-center min-w-[80px]">
                                        <span className="text-lg font-black text-violet-700">{h.hour}</span>
                                        <span className="text-[10px] font-bold text-violet-400 uppercase mt-1">{h.count} Ventas</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No hay suficientes datos horarios aún.</p>
                        )}
                    </div>

                    {/* 4. Expert Advice (The "Brain") */}
                    <div className="bg-slate-900 p-5 rounded-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />

                        <div className="relative z-10">
                            <h3 className="font-bold flex items-center gap-2 mb-3 text-indigo-300 text-sm uppercase tracking-wider">
                                <BrainCircuit className="w-4 h-4" />
                                Consejo Inteligente
                            </h3>

                            <p className="text-sm leading-relaxed text-slate-200">
                                {data.topProducts.length > 0 ? (
                                    <>
                                        Tus clientes prefieren <strong>{data.topProducts[0].name}</strong>.
                                        {data.peakHours.length > 0 && (
                                            <> Intenta tener stock extra listo antes de las <strong>{data.peakHours[0].hour}</strong>, tu hora más fuerte.</>
                                        )}
                                        <br /><br />
                                        <span className="text-indigo-300 font-bold block">💡 Tip:</span>
                                        Ofrece un combo con tu segundo producto más vendido (<strong>{data.topProducts[1]?.name || "otro item"}</strong>) para subir el ticket promedio de <strong>${data.averageTicket.toLocaleString('es-CL')}</strong>.
                                    </>
                                ) : (
                                    "Registra más ventas para generar un perfil detallado de tus clientes y recibir consejos personalizados."
                                )}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
