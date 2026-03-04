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
        <div id="f29-pdf-template" className="w-[790px] mx-auto bg-white text-[#0f172a] p-8" style={{ fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#0f172a' }}>

            {/* HEADERS Institucionales ATSIT */}
            <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4 mb-6">
                <div className="flex items-center gap-4">
                    {/* Logo ATSIT */}
                    <div className="w-32 h-auto" style={{ minWidth: "128px" }}>
                        <img src="/logo-atsit.png" alt="ATSIT Logo" className="w-full h-auto object-contain" />
                    </div>
                    <div className="pl-4 border-l-2 border-slate-200">
                        <h1 className="text-lg font-black text-[#0f172a] tracking-tight m-0 uppercase">ATSIT TELECOM</h1>
                        <p className="text-[10px] font-bold text-slate-500 m-0 tracking-widest uppercase mb-1">Servicios de Telecomunicaciones</p>
                        <div className="flex items-center text-[10px] text-slate-600 gap-2 mt-1 font-medium">
                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> at-sit-portafolio.vercel.app</span>
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> atsittelecom@gmail.com</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Contribuyente</p>
                    <p className="text-sm font-bold text-[#0f172a] m-0">{user?.name || "ATSIT Telecom SpA"}</p>
                    <p className="text-xs text-slate-500 m-0">{user?.email}</p>
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-[#0f172a] mb-1">Reporte Analítico F29</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200" style={{ backgroundColor: '#f1f5f9' }}>
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <span className="font-bold text-xs text-slate-700">Período: {monthName} {year}</span>
                    </div>
                </div>
            </div>

            {/* Resumen Ventas */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#4f46e5]" /> 1. Registros de Ventas e Ingresos
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#f8fafc' }}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Ventas Brutas</p>
                        <p className="text-base font-black text-[#0f172a]">${data.ventasBrutas.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#f8fafc' }}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Ventas Netas</p>
                        <p className="text-base font-black text-[#0f172a]">${data.ventasNetas.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-blue-200" style={{ backgroundColor: '#eff6ff' }}>
                        <p className="text-[10px] font-bold text-[#1d4ed8] uppercase">IVA Débito (Ventas)</p>
                        <p className="text-base font-black text-[#1d4ed8]">+ ${data.ivaDebito.toLocaleString('es-CL')}</p>
                    </div>
                </div>
            </div>

            {/* Resumen Compras */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4f46e5]" /> 2. Compras y Retenciones
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-emerald-200 flex justify-between items-center" style={{ backgroundColor: '#ecfdf5' }}>
                        <div>
                            <p className="text-[10px] font-bold text-[#047857] uppercase">IVA Crédito (Compras)</p>
                            <p className="text-lg font-black text-[#047857]">- ${data.ivaCredito.toLocaleString('es-CL')}</p>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: '#a7f3d0', color: '#065f46' }}>Aprobadas</span>
                    </div>
                    <div className="p-3 rounded-xl border border-orange-200 flex justify-between items-center" style={{ backgroundColor: '#fff7ed' }}>
                        <div>
                            <p className="text-[10px] font-bold text-[#c2410c] uppercase">Retención Honorarios</p>
                            <p className="text-lg font-black text-[#c2410c]">+ ${data.retencionHonorarios.toLocaleString('es-CL')}</p>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: '#fed7aa', color: '#9a3412' }}>15.25%</span>
                    </div>
                </div>
            </div>

            {/* Cuadro Resumen Final */}
            <div className="mb-4">
                <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4f46e5]" /> 3. Liquidación Resumen para TGR
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="font-bold text-xs text-slate-600">Impuesto IVA Mensual (Débito - Crédito)</span>
                            <span className="font-black text-sm text-[#0f172a]">${data.impuestoAPagar.toLocaleString('es-CL')}</span>
                        </div>

                        {data.remanenteIva > 0 && (
                            <div className="flex justify-between items-center p-2 rounded-lg border border-emerald-200" style={{ backgroundColor: '#d1fae5' }}>
                                <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: '#065f46' }}><Info className="w-3.5 h-3.5" /> Remanente Crédito</span>
                                <span className="font-black text-sm" style={{ color: '#065f46' }}>${data.remanenteIva.toLocaleString('es-CL')}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="font-bold text-xs text-slate-600">Retención de Boletas Honorarios (15.25%)</span>
                            <span className="font-black text-sm text-[#0f172a]">${data.retencionHonorarios.toLocaleString('es-CL')}</span>
                        </div>

                        <div className="flex justify-between items-center pb-1">
                            <span className="font-bold text-xs text-slate-600">PPM Obligatorio a Base ({data.tasaPpm}%)</span>
                            <span className="font-black text-sm text-[#0f172a]">${data.ppmAPagar.toLocaleString('es-CL')}</span>
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="p-4 flex justify-between items-center text-white" style={{ backgroundColor: '#4f46e5' }}>
                        <div>
                            <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest mb-0.5">Total F29 a Pagar</p>
                            <p className="text-[9px] opacity-75">Suma consolidada de obligaciones.</p>
                        </div>
                        <p className="text-3xl font-black m-0">${data.totalF29Pagar.toLocaleString('es-CL')}</p>
                    </div>
                </div>
            </div>

            {/* Footer del Reporte */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center flex flex-col items-center justify-center">
                <p className="text-[9px] text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">Este reporte fue generado automáticamente por <strong style={{ color: '#4f46e5' }}>ATSIT Telecom</strong>. Los montos pueden variar en la declaración oficial del portal SII debido a reajustes por IPC o multas vigentes.</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1">Generado el {new Date().toLocaleDateString("es-CL")} a las {new Date().toLocaleTimeString("es-CL")} hrs</p>
            </div>
        </div>
    );
}
