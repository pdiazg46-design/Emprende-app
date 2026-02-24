"use client"

import { useMemo } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { TrendingUp, Users, CreditCard } from 'lucide-react'

interface SaaSAnalyticsData {
    trendData: Array<{ month: string, pro: number, basic: number, trial: number }>;
    composition: { proTotal: number, basicTotal: number, trialTotal: number };
}

interface SaaSRevenueChartProps {
    data: SaaSAnalyticsData
}

// Colores Premium para el Dashboard
const COLORS = ['#8b5cf6', '#10b981', '#cbd5e1'] // Pro (Violeta), Básico (Esmeralda), Trial (Gris)

export function SaaSRevenueChart({ data }: SaaSRevenueChartProps) {
    const pieData = useMemo(() => [
        { name: 'Suscripción PRO', value: data.composition.proTotal },
        { name: 'Pago Único', value: data.composition.basicTotal },
        { name: 'En Prueba', value: data.composition.trialTotal }
    ], [data.composition])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Gráfico de Evolución Temporal (Crecimiento de Altas) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Crecimiento de Usuarios</h2>
                        <p className="text-sm text-slate-500 font-medium">Histórico de altas en la plataforma por modelo</p>
                    </div>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data.trendData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBasic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="pro"
                                name="Planes PRO"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPro)"
                            />
                            <Area
                                type="monotone"
                                dataKey="basic"
                                name="Pagos Único"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorBasic)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico de Composición Actual */}
            <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Estatus Actual</h2>
                        <p className="text-sm text-slate-500 font-medium">Distribución de base instalada</p>
                    </div>
                </div>

                <div className="flex-1 min-h-[200px] relative flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* El número de la dona */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                            {data.composition.proTotal + data.composition.basicTotal}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Pagados
                        </span>
                    </div>
                </div>

                {/* Leyenda Elegante */}
                <div className="grid grid-cols-1 gap-2 mt-4">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-violet-500 shadow-sm" />
                            <span className="text-xs font-bold text-slate-700">PRO VIP</span>
                        </div>
                        <span className="text-sm font-black text-violet-700">{data.composition.proTotal}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                            <span className="text-xs font-bold text-slate-700">Pago Único</span>
                        </div>
                        <span className="text-sm font-black text-emerald-700">{data.composition.basicTotal}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
