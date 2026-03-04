"use client"

import { DesktopLayout } from "@/components/layout/DesktopLayout"
import { useSession } from "next-auth/react"
import { ArrowLeft, Wallet, Building2, TrendingDown, Percent, CreditCard, SmartphoneNfc, Banknote, ShieldAlert, History, AlertCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { addTransaction } from "@/actions/transaction-actions"

export default function FinanceClient({ initialData, timeframe }: { initialData: any, timeframe: string }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isRetiroModalOpen, setIsRetiroModalOpen] = useState(false)
    const [retiroAmount, setRetiroAmount] = useState("")
    const [isSubmittingRetiro, setIsSubmittingRetiro] = useState(false)

    const { ventaBrutaTotal, dineroRealEnBanco, dineroCajaFisica, comisionesCobradas, breakdown, history } = initialData
    const legacyCount = breakdown?.legacyCount || 0;
    const totalRetiros = breakdown?.withdrawals || 0;

    const formatMoney = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Math.round(val))

    const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`/emprende/finanzas?timeframe=${e.target.value}`)
        router.refresh()
    }

    const handleManualRetiro = async (e: React.FormEvent) => {
        e.preventDefault()
        const parsedAmount = parseInt(retiroAmount.replace(/\D/g, ''))
        if (!parsedAmount || parsedAmount <= 0) return

        setIsSubmittingRetiro(true)
        try {
            await addTransaction({
                type: 'WITHDRAWAL',
                amount: parsedAmount,
                description: 'Retiro a Finanza Fácil'
            })
            setRetiroAmount("")
            setIsRetiroModalOpen(false)
            router.refresh()
        } catch (error) {
            alert("Error al registrar el retiro")
        } finally {
            setIsSubmittingRetiro(false)
        }
    }

    return (
        <DesktopLayout user={session?.user || { name: "Cargando..." }}>
            <div className="space-y-6 max-w-6xl mx-auto pb-20">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors md:hidden"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                Inteligencia Financiera
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                                Conciliación de Pagos, Comisiones y Cajas.
                            </p>
                        </div>
                    </div>

                    <select
                        value={timeframe}
                        onChange={handleTimeframeChange}
                        className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:right_10px_center] bg-no-repeat pr-10"
                    >
                        <option value="today">Día de Hoy (Caja Diaria)</option>
                        <option value="week">Última Semana</option>
                        <option value="month">Este Mes</option>
                        <option value="last_month">Mes Anterior</option>
                        <option value="year">Este Año</option>
                        <option value="last_year">Año Anterior</option>
                    </select>
                </header>

                {/* ALERTA DE DATOS HISTORICOS (LEGACY) */}
                {legacyCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 mt-4 animate-in fade-in slide-in-from-top-4">
                        <History className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-amber-900 text-sm">Transacciones Antiguas Detectadas ({legacyCount})</h4>
                            <p className="text-xs text-amber-800 leading-relaxed mt-1">
                                En este período hay ventas registradas antes de que la App soportara la separación de Tarjetas. Por defecto, todas estas ventas se han sumado a tu <b>Caja / Efectivo</b> asumiendo 0% de comisión.
                            </p>
                        </div>
                    </div>
                )}

                {/* ALERTA INCONSISTENCIA F29 */}
                {timeframe === 'last_month' && new Date().getFullYear() === 2026 && new Date().getMonth() <= 2 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-4 mt-4 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-orange-900 text-sm">Aviso: Inconsistencia F29 (Febrero)</h4>
                            <p className="text-xs text-orange-800 leading-relaxed mt-1">
                                Los gastos del mes anterior no tienen el formato requerido para el Formulario 29, ya que la integración de gastos a F29 se lanzó a principios de Marzo. Desde el mes actual en adelante, el F29 se conformará de manera limpia.
                            </p>
                        </div>
                    </div>
                )}

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity translate-x-2 -translate-y-2">
                            <Wallet className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-80">Venta Bruta Total</p>
                            <h3 className="text-3xl font-black mb-1 md:text-2xl lg:text-3xl">{formatMoney(ventaBrutaTotal)}</h3>
                            <p className="text-xs text-slate-300">Antes de descuentos de pasarelas</p>
                        </div>
                    </div>

                    <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity translate-x-2 -translate-y-2">
                            <Building2 className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest mb-1 opacity-80">Dinero Real en Banco</p>
                            <h3 className="text-3xl font-black mb-1 md:text-2xl lg:text-3xl">{formatMoney(dineroRealEnBanco)}</h3>
                            <p className="text-xs text-emerald-100">Transf. + Neto de Pasarelas</p>
                        </div>
                    </div>

                    <div className="bg-amber-400 text-white p-6 rounded-3xl shadow-xl shadow-amber-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity translate-x-2 -translate-y-2">
                            <Banknote className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-amber-100 uppercase tracking-widest mb-1 opacity-80">Caja / Efectivo</p>
                            <h3 className="text-3xl font-black text-amber-950 mb-1 md:text-2xl lg:text-3xl">{formatMoney(dineroCajaFisica)}</h3>
                            <p className="text-xs text-amber-900">Billetes físicos que debes tener</p>
                        </div>
                    </div>

                    <div className="bg-rose-50 text-rose-900 border border-rose-100 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity translate-x-2 -translate-y-2">
                            <TrendingDown className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-1">Comisiones (Fuga de Capital)</p>
                            <h3 className="text-3xl font-black text-rose-600 mb-1 md:text-2xl lg:text-3xl">-{formatMoney(comisionesCobradas)}</h3>
                            <p className="text-xs text-rose-400">Total retenido por SumUp / MP</p>
                        </div>
                    </div>
                </div>

                {/* DETALLE DE PASARELAS */}
                <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">Desglose por Medio de Pago</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* SUMUP CARD */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">SumUp (Tarjetas)</h3>
                                    <p className="text-xs text-slate-500">Tasa Mercado ≈ 3.45% con IVA</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Ventas Pasadas por Máquina</span>
                                <span className="text-slate-900 text-lg">{formatMoney(breakdown.sumup.gross)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold border-b border-slate-100 pb-2">
                                <span className="text-rose-500 flex items-center gap-1"><TrendingDown className="w-4 h-4" /> Comisión Restada</span>
                                <span className="text-rose-600">-{formatMoney(breakdown.sumup.fee)}</span>
                            </div>
                            <div className="flex justify-between items-center font-black pt-2">
                                <span className="text-emerald-600">Llegará al Banco (Líquido)</span>
                                <span className="text-2xl text-emerald-500">{formatMoney(breakdown.sumup.net)}</span>
                            </div>
                        </div>
                    </div>

                    {/* MERCADO PAGO CARD */}
                    <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <SmartphoneNfc className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Mercado Pago (QR)</h3>
                                    <p className="text-xs text-slate-500">Tasa Mercado ≈ 3.56% con IVA</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold border-b border-blue-50 pb-2">
                                <span className="text-slate-500">Ventas Recibidas por QR</span>
                                <span className="text-slate-900 text-lg">{formatMoney(breakdown.mp.gross)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold border-b border-blue-50 pb-2">
                                <span className="text-rose-500 flex items-center gap-1"><TrendingDown className="w-4 h-4" /> Comisión Restada</span>
                                <span className="text-rose-600">-{formatMoney(breakdown.mp.fee)}</span>
                            </div>
                            <div className="flex justify-between items-center font-black pt-2">
                                <span className="text-emerald-600">Ganancia Neta MP</span>
                                <span className="text-2xl text-emerald-500">{formatMoney(breakdown.mp.net)}</span>
                            </div>
                        </div>
                    </div>

                    {/* RETIROS DE CAJA CARD */}
                    <div className="bg-white rounded-3xl border border-violet-100 shadow-sm p-6 flex flex-col justify-between md:col-span-2 xl:col-span-1">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                    <ArrowLeft className="w-6 h-6 rotate-45" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Retiros de Caja</h3>
                                    <p className="text-xs text-slate-500">Dinero extraído físicamente</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsRetiroModalOpen(true)}
                                className="text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200 transition-colors"
                            >
                                + Nuevo Retiro
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold border-b border-violet-50 pb-2">
                                <span className="text-slate-500">Monto total extraído</span>
                                <span className="text-violet-600 text-lg">-{formatMoney(totalRetiros)}</span>
                            </div>
                            <div className="flex justify-between items-center font-black pt-2">
                                <span className="text-slate-600 text-xs leading-tight">Este valor ha sido descontado<br />matemáticamente de Caja / Efectivo</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* MODAL RETIRO MANUAL */}
                {isRetiroModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 relative">
                            <button
                                onClick={() => setIsRetiroModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-600">
                                <Banknote className="w-8 h-8" />
                            </div>

                            <h3 className="text-xl font-black text-center text-slate-800 mb-1">Registrar Retiro</h3>
                            <p className="text-center text-sm text-slate-500 mb-6">Extraer billetes de la caja física</p>

                            <form onSubmit={handleManualRetiro} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Monto a retirar</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            required
                                            value={retiroAmount}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '')
                                                setRetiroAmount(val ? parseInt(val).toLocaleString('es-CL') : '')
                                            }}
                                            className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmittingRetiro || !retiroAmount}
                                    className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black tracking-widest uppercase hover:bg-violet-700 transition-colors disabled:opacity-50"
                                >
                                    {isSubmittingRetiro ? "Procesando..." : "Confirmar Retiro"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ALERTA DE SEPARACION */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4 mt-8">
                    <ShieldAlert className="w-8 h-8 text-indigo-500 shrink-0" />
                    <div>
                        <h4 className="font-bold text-indigo-900">Estricta Separación de Efectivo</h4>
                        <p className="text-sm text-indigo-700 leading-relaxed">
                            Cualquier venta registrada como Efectivo o Transferencia Directa asume un **0% de descuento**.
                            Tu caja menor (Billetes) actualmente debería tener físicamente **{formatMoney(dineroCajaFisica)}** del período seleccionado,
                            mientras que tu saldo en cuenta bancaria debería crecer en **{formatMoney(dineroRealEnBanco)}**.
                        </p>
                    </div>
                </div>

            </div>
        </DesktopLayout>
    )
}
