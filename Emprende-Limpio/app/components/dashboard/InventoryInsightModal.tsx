"use client"

import { useEffect, useState } from "react"
import { X, Package, TrendingUp, AlertTriangle, BrainCircuit, DollarSign, BarChart3, Loader2 } from "lucide-react"
import { getInventoryInsights } from "@/actions/transaction-actions"

interface InventoryInsightModalProps {
    onClose: () => void
}

export function InventoryInsightModal({ onClose }: InventoryInsightModalProps) {
    const [insights, setInsights] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await getInventoryInsights()
            setInsights(data)
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-blue-50 p-6 flex items-center justify-between border-b border-blue-100 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100">
                            <BrainCircuit className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-blue-950 uppercase tracking-wide leading-none">
                                Salud de Stock
                            </h3>
                            <p className="text-xs font-bold text-blue-400 mt-1">
                                INTELIGENCIA DE INVENTARIO
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white rounded-full hover:bg-blue-100 text-blue-300 hover:text-blue-600 transition-colors shadow-sm border border-transparent hover:border-blue-200"
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
                                <Package className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Total Items</span>
                            </div>
                            {loading ? (
                                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                            ) : (
                                <p className="text-2xl font-black text-slate-800">
                                    {insights?.totalItems || 0}
                                </p>
                            )}
                        </div>

                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2 text-blue-400">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Valor Total</span>
                            </div>
                            {loading ? (
                                <div className="h-8 w-24 bg-blue-200/50 rounded animate-pulse" />
                            ) : (
                                <p className="text-2xl font-black text-blue-600">
                                    ${insights?.totalValue?.toLocaleString('es-CL') || 0}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 2. Low Stock Alerts */}
                    {insights?.lowStockItems?.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Alertas de Stock
                            </h4>
                            <div className="space-y-3">
                                {insights.lowStockItems.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-600 font-bold text-xs ring-2 ring-amber-100">
                                                !
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                                <p className="text-xs text-amber-700 font-medium">Quedan {item.stock} unidades</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold bg-white text-amber-600 px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                                            Reponer
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Top Valued Items */}
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            Mayor Inversión
                        </h4>
                        <div className="space-y-3">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-12 w-full bg-slate-50 rounded-xl animate-pulse" />
                                ))
                            ) : insights?.topValuedItems?.length > 0 ? (
                                insights.topValuedItems.map((item: any, i: number) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                                #{i + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{item.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">Stock: {item.stock}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900 text-sm">
                                                ${(item.price * item.stock).toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-4">
                                    Inventario vacío.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 4. Expert Advice */}
                    <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-xl text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 text-blue-300">
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
