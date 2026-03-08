"use client"

import { useState } from "react"
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Sector 
} from "recharts"
import { Download, ChevronRight, Tags, TrendingDown, Clock, Lock, ShieldCheck, PieChart as PieChartIcon } from "lucide-react"

interface ExpenseInsightData {
    totalExpenses: number
    averageMonthly: number
    topCategories: { name: string, value: number }[]
    advice: string
    historyCount: number
    trend: { label: string, amount: number }[]
}

export function ExpenseAnalyticsContainer({ 
    insights, 
    isPro, 
    timeframe 
}: { 
    insights: ExpenseInsightData | null, 
    isPro: boolean, 
    timeframe: string 
}) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    if (!insights || insights.historyCount === 0) {
        return (
            <div className="hidden lg:flex w-full h-[400px] items-center justify-center bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-8">
                <div className="text-center">
                    <PieChartIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No hay suficientes datos analíticos en este período.</p>
                </div>
            </div>
        )
    }

    if (!isPro) {
        return (
            <div className="hidden lg:block relative w-full overflow-hidden rounded-[2rem] border border-slate-100 shadow-md mt-8 group select-none">
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center transition-all">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl max-w-md text-center transform group-hover:scale-105 transition-transform duration-500 border border-slate-700">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-glow">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight">Analítica de Gastos PRO</h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                            Descubre en qué categorías se va tu dinero, analiza fugas financieras y descarga reportes de costos.
                        </p>
                        <button className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl font-black tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <ShieldCheck className="w-5 h-5" /> Mejorar Mi Plan
                        </button>
                    </div>
                </div>
                
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
        csvContent += "Categoria,Gasto Total\n"
        
        insights.topCategories.forEach(row => {
            const cleanName = row.name.replace(/,/g, "")
            csvContent += `${cleanName},${row.value}\n`
        })
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `Emprende_Gastos_${timeframe}_${new Date().getTime()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const COLORS = ['#f43f5e', '#ec4899', '#f97316', '#eab308', '#8b5cf6']

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

    const TypedPie = Pie as any;

    return (
        <div className="hidden lg:flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Header / Export */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <TrendingDown className="w-6 h-6 text-rose-500" /> Dashboard PRO de Gastos
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Estudio detallado de tus costos y salidas de dinero.
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
                
                {/* TENDENCIAS DE GASTOS (AREA CHART) */}
                <div className="col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="font-black text-slate-700 mb-6 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-slate-400" /> Evolución de Gastos
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={insights.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="label" stroke="#cbd5e1" fontSize={12} fontWeight="bold" tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#cbd5e1" fontSize={12} fontWeight="bold" tickFormatter={(v) => `$${(v/1000)}k`} axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <RechartsTooltip 
                                    formatter={(value: any) => [`$${value.toLocaleString('es-CL')}`, 'Gasto Total']}
                                    labelFormatter={(label) => `Período: ${label}`}
                                    labelStyle={{ fontWeight: 'black', color: '#f43f5e', marginBottom: '4px' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', backgroundColor: 'white' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PROMEDIO DIARIO & AI ADVICE */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-rose-900 to-rose-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Clock className="w-24 h-24" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-rose-300 uppercase tracking-widest mb-1 mt-2">Gasto Promedio Diario</h3>
                            <p className="text-4xl font-black mb-6">${insights.averageMonthly.toLocaleString('es-CL')}</p>
                        </div>
                        
                        <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                            <p className="text-sm font-medium leading-relaxed text-rose-50">{insights.advice}</p>
                        </div>
                    </div>
                </div>

                {/* TOP CATEGORIAS (DONUT & LIST) */}
                <div className="col-span-5 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="font-black text-slate-700 mb-2 flex items-center gap-2">
                        <Tags className="w-4 h-4 text-slate-400" /> Distribución de Categorías
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 font-medium">Clic en el gráfico o la lista para profundizar en la métrica (Drill-down).</p>
                    
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <TypedPie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={insights.topCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onClick={(_: any, index: number) => {
                                        setActiveIndex(index)
                                        setSelectedCategory(insights.topCategories[index].name)
                                    }}
                                    className="cursor-pointer focus:outline-none"
                                >
                                    {insights.topCategories.map((entry: any, index: number) => (
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
                        <Tags className="w-4 h-4 text-slate-400" /> Top Ítems de Gasto
                    </h3>
                    
                    <div className="flex-1 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-2 bg-slate-100 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-200">
                            <div className="col-span-8">Categoría / Descripción</div>
                            <div className="col-span-3 text-right">Costo Total</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[250px] p-2">
                            {insights.topCategories.map((p, idx) => {
                                const isSelected = selectedCategory === p.name || (!selectedCategory && idx === activeIndex)
                                
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => {
                                            setActiveIndex(idx)
                                            setSelectedCategory(p.name)
                                        }}
                                        className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${
                                            isSelected ? 'bg-rose-50 border border-rose-100 shadow-sm' : 'hover:bg-white'
                                        }`}
                                    >
                                        <div className="col-span-8 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full ring-2 ring-offset-2 shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length], borderColor: COLORS[idx % COLORS.length] }} />
                                            <span className={`text-sm font-bold truncate ${isSelected ? 'text-rose-900' : 'text-slate-700'}`}>{p.name}</span>
                                        </div>
                                        <div className="col-span-3 text-right text-sm font-black text-rose-600">
                                            ${p.value.toLocaleString('es-CL')}
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-rose-500 translate-x-1' : 'text-slate-300'}`} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
