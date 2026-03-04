import { getF29Data } from "@/actions/f29-actions";
import { Calculator, FileText, AlertCircle, Calendar, DollarSign, ArrowLeft, Download, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import F29MonthSelect from "./F29MonthSelect";

// Force dynamic
export const dynamic = 'force-dynamic';

export default async function F29Page(props: {
    searchParams: Promise<{ month?: string, year?: string }>
}) {
    const searchParams = await props.searchParams;
    const today = new Date();
    // JS dates are 0-indexed for month. (Marzo = 2)
    const currentMonth = searchParams.month ? parseInt(searchParams.month) : today.getMonth();
    const currentYear = searchParams.year ? parseInt(searchParams.year) : today.getFullYear();

    // Si es Febrero 2026 o anterior, se considera inconsistente para F29 automático
    const isInconsistentMonth = currentYear < 2026 || (currentYear === 2026 && currentMonth <= 1);

    let data;
    try {
        data = await getF29Data(currentYear, currentMonth);
    } catch (e: any) {
        if (e.message.includes("desactivado")) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Calculator className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Módulo Tributario Inactivo</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">
                        El Simulador F29 procesa Inteligencia Contable avanzada para Chile. Solo el Super Administrador puede activar esta función Vip para tu cuenta.
                    </p>
                    <Link href="/emprende" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                        Volver al Inicio
                    </Link>
                </div>
            )
        }
        throw e; // Lanza error genérico para Error boundary
    }

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32 md:pb-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Link
                            href="/emprende"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors flex items-center justify-center"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Simulador F29
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] px-2 py-1 rounded-md uppercase tracking-widest font-black shadow-sm translate-y-[-2px]">AutoF29</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium">
                        Liquidación de impuestos mensual con normas SII simplificadas.
                    </p>
                </div>

                <F29MonthSelect currentMonth={currentMonth} currentYear={currentYear} />
            </header>

            {data.isDemo && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <div className="w-10 h-10 bg-amber-100/50 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900 mb-1">Vista Previa Super Admin</h4>
                        <p className="text-amber-800/80 text-sm font-medium leading-relaxed">
                            Estás viendo este módulo matemático como cuenta Super Admin. Los clientes normales verán error de inactivo hasta que se les asigne 100% de la funcionalidad desde el Panel.
                        </p>
                    </div>
                </div>
            )}

            {isInconsistentMonth && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <div className="w-10 h-10 bg-orange-100/50 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-orange-900 mb-1">Aviso: Inconsistencia F29</h4>
                        <p className="text-orange-800/80 text-sm font-medium leading-relaxed">
                            Los gastos de este mes ({monthNames[currentMonth]} {currentYear}) no tienen el formato requerido para el Formulario 29, ya que la integración de gastos a F29 se lanzó a principios de Marzo. Desde el mes de Marzo en adelante, el F29 se conformará de manera 100% limpia.
                        </p>
                    </div>
                </div>
            )}

            {!isInconsistentMonth && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <div className="w-10 h-10 bg-emerald-100/50 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-900 mb-1">AutoF29 Optimizado</h4>
                        <p className="text-emerald-800/80 text-sm font-medium leading-relaxed">
                            Desde este mes en adelante, todos los gastos y ventas se conforman de manera limpia para tu Formulario 29.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-6">

                {/* 1. SECCIÓN VENTAS (DÉBITO) */}
                <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Registro de Ventas</h2>
                            <p className="text-sm font-medium text-slate-500">Ingresos mensuales y desglose de IVA (19%)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bruto</p>
                            <p className="text-2xl font-black text-slate-900">${data.ventasBrutas.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Neto</p>
                            <p className="text-2xl font-black text-green-700">${data.ventasNetas.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <FileText className="w-24 h-24 text-blue-600" />
                            </div>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1 relative z-10">IVA Débito Fiscal</p>
                            <p className="text-2xl font-black text-blue-700 relative z-10">+ ${data.ivaDebito.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </section>

                {/* 2. SECCIÓN COMPRAS (CRÉDITO) Y HONORARIOS */}
                <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Compras y Honorarios</h2>
                            <p className="text-sm font-medium text-slate-500">Gastos con y sin respaldo tributario.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Crédito Fiscal */}
                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <p className="text-xs font-bold text-emerald-600 md:text-emerald-500 uppercase tracking-widest w-1/2">IVA Crédito Fiscal (Compras)</p>
                                <span className="bg-emerald-200/50 text-emerald-800 text-[10px] px-2 py-1 rounded font-black tracking-widest">FACTURAS ACEPTADAS</span>
                            </div>
                            <p className="text-3xl font-black text-emerald-700 relative z-10">- ${data.ivaCredito.toLocaleString('es-CL')}</p>
                        </div>

                        {/* Retención Honorarios */}
                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <p className="text-xs font-bold text-orange-600 md:text-orange-500 uppercase tracking-widest w-1/2">Retención de Honorarios</p>
                                <span className="bg-orange-200/50 text-orange-800 text-[10px] px-2 py-1 rounded font-black tracking-widest">15.25% RETENIDO</span>
                            </div>
                            <p className="text-3xl font-black text-orange-700 relative z-10">+ ${data.retencionHonorarios.toLocaleString('es-CL')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Gastos No Declarables (Vales)</span>
                            <span className="font-black text-slate-700">${data.gastosSinRespaldo.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Gastos Exentos (SumUp)</span>
                            <span className="font-black text-slate-700">${data.gastosExentos.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                </section>

                {/* 3. LÍNEA FINAL (RESUMEN F29) */}
                <section className="bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Calculator className="w-64 h-64 text-white" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-white tracking-tight">Resumen Declaración TGR</h2>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-white/80">
                                <span className="font-medium text-sm">Impuesto Mensual (Débito - Crédito)</span>
                                <span className="font-black text-lg">${data.impuestoAPagar.toLocaleString('es-CL')}</span>
                            </div>

                            {data.remanenteIva > 0 && (
                                <div className="flex justify-between items-center text-emerald-400 bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20">
                                    <span className="font-bold text-sm flex items-center gap-2"><Info className="w-4 h-4" /> Remanente de Crédito (A favor mes prox)</span>
                                    <span className="font-black text-lg">${data.remanenteIva.toLocaleString('es-CL')}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-white/80 border-t border-white/10 pt-4">
                                <span className="font-medium text-sm">Retención Boletas Honorarios (15.25%)</span>
                                <span className="font-black text-lg">${data.retencionHonorarios.toLocaleString('es-CL')}</span>
                            </div>

                            <div className="flex justify-between items-center text-white/80">
                                <span className="font-medium text-sm flex items-center gap-2">PPM Obligatorio ({data.tasaPpm}%)</span>
                                <span className="font-black text-lg">${data.ppmAPagar.toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-blue-900/40 border border-white/10 relative overflow-hidden">
                            <div className="absolute -left-10 w-40 h-full bg-white/5 opacity-0 transform -skew-x-12 translate-x-full transition-all group-hover:opacity-100"></div>

                            <div>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Costo F29 a Pagar</p>
                                <p className="text-5xl font-black text-white tracking-tighter">
                                    ${data.totalF29Pagar.toLocaleString('es-CL')}
                                </p>
                            </div>

                            <button className="bg-white text-indigo-900 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <Download className="w-4 h-4" /> Exportar a Contador
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
