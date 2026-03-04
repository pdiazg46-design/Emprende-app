import { Calculator, FileText, Calendar, DollarSign, Info, CheckCircle2, Globe, Mail } from "lucide-react";

interface F29PrintReportProps {
    data: any;
    monthIndex: number;
    year: number;
    user: any;
}

export default function F29PrintReport({ data, monthIndex, year, user }: F29PrintReportProps) {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const monthName = monthNames[monthIndex];

    return (
        <div className="hidden print:block w-full bg-white print:bg-white text-slate-900" style={{ fontFamily: 'sans-serif' }}>
            {/* Controlamos el layout completo usando Tailwind print utilities y paddings precisos */}
            <div className="p-8 max-w-4xl mx-auto">

                {/* HEADERS Institucionales ATSIT */}
                <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        {/* Logo ATSIT */}
                        <div className="w-40 h-auto">
                            <img src="/logo-atsit.png" alt="ATSIT Logo" className="w-full h-auto object-contain" />
                        </div>
                        <div className="pl-4 border-l-2 border-slate-200">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 uppercase">ATSIT TELECOM</h1>
                            <p className="text-xs font-bold text-slate-500 m-0 tracking-widest uppercase mb-1">Servicios de Telecomunicaciones</p>
                            <div className="flex items-center text-xs text-slate-600 gap-3 mt-2 font-medium">
                                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> <a href="https://at-sit-portafolio.vercel.app/" className="text-blue-600 no-underline" target="_blank" rel="noreferrer">at-sit-portafolio.vercel.app</a></span>
                                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> atsittelecom@gmail.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contribuyente / Usuario</p>
                        <p className="text-lg font-bold text-slate-800 m-0">{user?.name || "ATSIT Telecom SpA"}</p>
                        <p className="text-sm text-slate-500 m-0">{user?.email}</p>
                    </div>
                </div>

                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Reporte Analítico F29</h2>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <Calendar className="w-5 h-5 text-slate-600" />
                            <span className="font-bold text-slate-700">Período Tributario: {monthName} {year}</span>
                        </div>
                    </div>
                </div>

                {/* Resumen Ventas e IVA Débito */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-indigo-600" /> 1. Registros de Ventas e Ingresos
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <p className="text-xs font-bold text-slate-500 uppercase">Ventas Brutas</p>
                            <p className="text-xl font-black text-slate-900">${data.ventasBrutas.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <p className="text-xs font-bold text-slate-500 uppercase">Ventas Netas</p>
                            <p className="text-xl font-black text-slate-900">${data.ventasNetas.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <p className="text-xs font-bold text-blue-700 uppercase">IVA Débito (Ventas)</p>
                            <p className="text-xl font-black text-blue-700">+ ${data.ivaDebito.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>

                {/* Resumen Compras e IVA Crédito */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" /> 2. Compras y Retenciones
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <div>
                                <p className="text-xs font-bold text-emerald-700 uppercase">IVA Crédito (Compras)</p>
                                <p className="text-2xl font-black text-emerald-700">- ${data.ivaCredito.toLocaleString('es-CL')}</p>
                            </div>
                            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-1 rounded font-bold uppercase tracking-wider">Aprobadas</span>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex justify-between items-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <div>
                                <p className="text-xs font-bold text-orange-700 uppercase">Retención Honorarios</p>
                                <p className="text-2xl font-black text-orange-700">+ ${data.retencionHonorarios.toLocaleString('es-CL')}</p>
                            </div>
                            <span className="text-[10px] bg-orange-200 text-orange-800 px-2 py-1 rounded font-bold uppercase tracking-wider">15.25%</span>
                        </div>
                    </div>
                </div>

                {/* Cuadro Resumen Final */}
                <div className="mb-8 page-break-inside-avoid">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" /> 3. Liquidación Resumen para TGR
                    </h3>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                <span className="font-bold text-slate-600">Impuesto IVA Mensual (Débito - Crédito)</span>
                                <span className="font-black text-lg text-slate-900">${data.impuestoAPagar.toLocaleString('es-CL')}</span>
                            </div>

                            {data.remanenteIva > 0 && (
                                <div className="flex justify-between items-center bg-emerald-100/50 p-3 rounded-lg border border-emerald-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                    <span className="font-bold text-emerald-800 flex items-center gap-2"><Info className="w-4 h-4" /> Remanente de Crédito a Favor</span>
                                    <span className="font-black text-lg text-emerald-800">${data.remanenteIva.toLocaleString('es-CL')}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                <span className="font-bold text-slate-600">Retención de Boletas Honorarios (15.25%)</span>
                                <span className="font-black text-lg text-slate-900">${data.retencionHonorarios.toLocaleString('es-CL')}</span>
                            </div>

                            <div className="flex justify-between items-center pb-2">
                                <span className="font-bold text-slate-600">PPM Obligatorio a Base ({data.tasaPpm}%)</span>
                                <span className="font-black text-lg text-slate-900">${data.ppmAPagar.toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        {/* Totales */}
                        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <div>
                                <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Total Final a Pagar F29</p>
                                <p className="text-xs opacity-75">Suma consolidada de obligaciones del período.</p>
                            </div>
                            <p className="text-4xl font-black m-0">${data.totalF29Pagar.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>

                {/* Footer del Reporte */}
                <div className="mt-16 pt-6 border-t border-slate-200 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400 font-medium">Este reporte fue generado automáticamente por <strong className="text-indigo-600">ATSIT Telecom</strong>. Los montos pueden variar en la declaración oficial del portal SII debido a reajustes por IPC o multas vigentes.</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">Documento generado el {new Date().toLocaleDateString("es-CL")} a las {new Date().toLocaleTimeString("es-CL")} hrs</p>
                </div>
            </div>
        </div>
    );
}
