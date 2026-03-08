"use client"

import { useState } from "react"
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Sector 
} from "recharts"
import { Download, ChevronRight, Package, TrendingUp, TrendingDown, Clock, Lock, ShieldCheck, PieChart as PieChartIcon, Store } from "lucide-react"

interface InsightData {
    totalRevenue: number
    totalTransactions: number
    topProducts: { name: string, quantity: number, revenue: number }[]
    peakHours: { hour: string, count: number, intensity: number }[]
    averageTicket: number
    trend: { label: string, amount: number }[]
    fairPerformance?: { 
        name: string, 
        totalRevenue: number, 
        transactionCount: number,
        topProduct?: { name: string, quantity: number, revenue: number },
        peakHour?: string
    }[]
    unsoldProducts?: { name: string, stock: number, cost: number }[]
}

export function SalesAnalyticsContainer({ 
    insights, 
    isPro, 
    timeframe 
}: { 
    insights: InsightData | null, 
    isPro: boolean, 
    timeframe: string 
}) {
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    // Si no hay datos aún
    if (!insights || insights.totalTransactions === 0) {
        return (
            <div className="hidden lg:flex w-full h-[400px] items-center justify-center bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-8">
                <div className="text-center">
                    <PieChartIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No hay suficientes datos analíticos en este período.</p>
                </div>
            </div>
        )
    }

    // --- PAYWALL PRO VIP ---
    if (!isPro) {
        return (
            <div className="hidden lg:block relative w-full overflow-hidden rounded-[2rem] border border-slate-100 shadow-md mt-8 group select-none">
                {/* Blur Overlay */}
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center transition-all">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl max-w-md text-center transform group-hover:scale-105 transition-transform duration-500 border border-slate-700">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mb-6 shadow-glow">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight">Analítica Avanzada PRO</h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                            Descubre qué productos te dejan más margen, a qué hora vendes más y descarga reportes dinámicos.
                        </p>
                        <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-black tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <ShieldCheck className="w-5 h-5" /> Mejorar Mi Plan
                        </button>
                    </div>
                </div>
                
                {/* Fake Background (Blurred preview) */}
                <div className="p-8 opacity-40 blur-[2px] pointer-events-none">
                    <h3 className="text-xl font-black mb-6">Tendencia Estimada</h3>
                    <div className="h-[300px] w-full bg-slate-100 rounded-2xl animate-pulse"></div>
                </div>
            </div>
        )
    }

    const exportToCSV = () => {
        if (!insights) return
        
        let csvContent = "data:text/csv;charset=utf-8,"
        csvContent += "Producto,Cantidad Vendida,Ingreso Total\n"
        
        insights.topProducts.forEach(row => {
            const cleanName = row.name.replace(/,/g, "")
            csvContent += `${cleanName},${row.quantity},${row.revenue}\n`
        })
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `Emprende_Reporte_${timeframe}_${new Date().getTime()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
        return (
            <g>
                <text x={cx} y={cy} dy={-8} textAnchor="middle" fill="#1e293b" fontWeight="900" fontSize="14">
                    {payload.name.substring(0, 15)}...
                </text>
                <text x={cx} y={cy} dy={12} textAnchor="middle" fill="#64748b" fontWeight="bold" fontSize="12">
                    ${value.toLocaleString('es-CL')}
                </text>
                <Sector
                    cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
                    startAngle={startAngle} endAngle={endAngle} fill={fill}
                />
            </g>
        );
    };

    const selectedProductData = selectedProduct 
        ? insights.topProducts.find(p => p.name === selectedProduct) 
        : null

    const TypedPie = Pie as any;

    return (
        <div className="hidden lg:flex flex-col gap-6 mt-8 w-full animate-in fade-in duration-500">
            {/* Header / Export */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-violet-600" /> Dashboard PRO Analítico
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Estudio detallado de tu comportamiento de ventas.
                    </p>
                </div>
                <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
                >
                    <Download className="w-4 h-4" /> Exportar CSV
                </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
                
                {/* TENDENCIAS DE VENTAS (AREA CHART) */}
                <div className="col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="font-black text-slate-700 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" /> Evolución de Ingresos
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={insights.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="label" stroke="#cbd5e1" fontSize={12} fontWeight="bold" tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#cbd5e1" fontSize={12} fontWeight="bold" tickFormatter={(v) => `$${(v/1000)}k`} axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <RechartsTooltip 
                                    formatter={(value: any) => [`$${value.toLocaleString('es-CL')}`, 'Ingreso Total']}
                                    labelFormatter={(label) => `Período: ${label}`}
                                    labelStyle={{ fontWeight: 'black', color: '#8b5cf6', marginBottom: '4px' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', backgroundColor: 'white' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* HORAS PUNTA & TICKET PROMEDIO */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Clock className="w-24 h-24" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Eficiencia Horaria</h3>
                        
                        <div className="space-y-4 relative z-10">
                            {insights.peakHours.length > 0 ? (
                                insights.peakHours.map((ph, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                            <span className="font-bold text-slate-200">{ph.hour}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">{ph.count} Tx</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400">Aún no hay horas definidas.</p>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Promedio</p>
                            <p className="text-3xl font-black">${insights.averageTicket.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>

                {/* TOP PRODUCTOS (DONUT & LIST) */}
                <div className="col-span-5 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="font-black text-slate-700 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" /> Distribución de Productos
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 font-medium">Clic en el gráfico o la lista para profundizar en la métrica (Drill-down).</p>
                    
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <TypedPie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={insights.topProducts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="revenue"
                                    onClick={(_: any, index: number) => {
                                        setActiveIndex(index)
                                        setSelectedProduct(insights.topProducts[index].name)
                                    }}
                                    className="cursor-pointer focus:outline-none"
                                >
                                    {insights.topProducts.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </TypedPie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* DRILL DOWN PANEL (TABLA DINAMICA MINI) */}
                <div className="col-span-7 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col">
                    <h3 className="font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" /> Análisis Individual de Producto
                    </h3>
                    
                    <div className="flex-1 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-2 bg-slate-100 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-200">
                            <div className="col-span-6">Producto Top</div>
                            <div className="col-span-2 text-center">Unidades</div>
                            <div className="col-span-3 text-right">Ingreso Bruto</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[250px] p-2">
                            {insights.topProducts.map((p, idx) => {
                                const isSelected = selectedProduct === p.name || (!selectedProduct && idx === activeIndex)
                                
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => {
                                            setActiveIndex(idx)
                                            setSelectedProduct(p.name)
                                        }}
                                        className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${
                                            isSelected ? 'bg-violet-50 border border-violet-100 shadow-sm' : 'hover:bg-white'
                                        }`}
                                    >
                                        <div className="col-span-6 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full ring-2 ring-offset-2" style={{ backgroundColor: COLORS[idx % COLORS.length], borderColor: COLORS[idx % COLORS.length] }} />
                                            <span className={`text-sm font-bold truncate ${isSelected ? 'text-violet-900' : 'text-slate-700'}`}>{p.name}</span>
                                        </div>
                                        <div className="col-span-2 text-center text-sm font-black text-slate-600">
                                            {p.quantity} x
                                        </div>
                                        <div className="col-span-3 text-right text-sm font-black text-slate-900">
                                            ${p.revenue.toLocaleString('es-CL')}
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-violet-500 translate-x-1' : 'text-slate-300'}`} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* SECCIÓN ANALÍTICA DE FERIAS (NUEVO) */}
            {insights.fairPerformance && insights.fairPerformance.length > 0 && (
                <div className="w-full bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden group mb-8">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform duration-700">
                        <Store className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="max-w-md">
                            <h3 className="text-sm font-black uppercase tracking-widest text-violet-200 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Inteligencia Eventos Físicos
                            </h3>
                            <h2 className="text-3xl font-black mb-3">Reporte IA de Ferias</h2>
                            <p className="text-violet-100 font-medium leading-relaxed text-sm">
                                Has estado registrando ventas bajo eventos físicos específicos. 
                                La IA indica que tu evento más rentable hasta la fecha es <span className="font-black text-white">{insights.fairPerformance[0].name}</span>, generando <span className="font-black text-white">${insights.fairPerformance[0].totalRevenue.toLocaleString('es-CL')}</span>.
                            </p>
                        </div>

                        <div className="flex-1 w-full grid grid-cols-1 gap-3">
                            {insights.fairPerformance.map((fair, idx) => (
                                <div key={idx} className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between border border-white/10 hover:bg-black/30 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-sm shrink-0">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{fair.name}</p>
                                            <p className="text-xs font-bold text-violet-200 uppercase tracking-widest">{fair.transactionCount} Transacciones</p>
                                            
                                            {/* AI Detailed Metrics per Fair */}
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {fair.topProduct && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md text-white">
                                                        ⭐ Top: {fair.topProduct.name} ({fair.topProduct.quantity} un.)
                                                    </span>
                                                )}
                                                {fair.peakHour && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md text-white">
                                                        🔥 Hora Punta: {fair.peakHour}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right mt-2 md:mt-0 w-full md:w-auto border-t border-white/10 md:border-0 pt-3 md:pt-0">
                                        <p className="font-black text-xl">${fair.totalRevenue.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Unsold Products Warning (General Context) */}
                            {insights.unsoldProducts && insights.unsoldProducts.length > 0 && (
                                <div className="mt-2 bg-rose-500/20 border border-rose-500/30 rounded-2xl p-4 flex gap-3">
                                    <TrendingDown className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-rose-100 mb-1">Inventario inmovilizado durante este periodo:</p>
                                        <ul className="text-xs text-rose-200/80 space-y-1">
                                            {insights.unsoldProducts.map((up, i) => (
                                                <li key={i}>• {up.name} ({up.stock} unidades = ${up.cost.toLocaleString('es-CL')})</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
