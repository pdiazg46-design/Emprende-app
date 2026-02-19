"use client"

import { X, Mic, Package, ShoppingBag, Receipt, Calculator, ChevronRight, Sparkles } from "lucide-react"

export function VoiceHelpModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Entrenamiento de Voz</h2>
                        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                            Domina tu negocio usando solo tu voz. Aquí tienes los comandos esenciales.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Sales */}
                    <Section icon={<ShoppingBag className="w-5 h-5 text-emerald-500" />} title="Ventas Rápidas" color="bg-emerald-50">
                        <Example cmd="Vende 1 Coca Cola" desc="Venta de 1 producto específico" />
                        <Example cmd="2 Bebidas y 1 Pan" desc="Venta múltiple agrupada" />
                        <Example cmd="5000" desc="Venta rápida solo por monto" />
                    </Section>

                    {/* Expenses */}
                    <Section icon={<Receipt className="w-5 h-5 text-rose-500" />} title="Control de Gastos" color="bg-rose-50">
                        <Example cmd="Gasto de 5000 en Luz" desc="Registra monto y motivo" />
                        <Example cmd="Pagué el Arriendo" desc="Detecta gastos fijos comunes" />
                    </Section>

                    {/* Inventory */}
                    <Section icon={<Package className="w-5 h-5 text-blue-500" />} title="Inventario Inteligente" color="bg-blue-50">
                        <Example cmd="Llegaron 50 Latas" desc="Suma stock automáticamente" />
                        <Example cmd="Crear Pan a 1000" desc="Crea un producto nuevo con precio" />
                    </Section>
                </div>

                {/* Footer Hint */}
                <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">
                        💡 Tip: Intenta hablar natural. "Anota una venta de..."
                    </p>
                </div>
            </div>
        </div>
    )
}

function Section({ icon, title, color, children }: { icon: React.ReactNode, title: string, color: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
            </div>
            <div className="space-y-2 pl-2">
                {children}
            </div>
        </div>
    )
}

function Example({ cmd, desc }: { cmd: string, desc: string }) {
    return (
        <div className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-3 border border-slate-100 group cursor-default">
            <div className="flex items-center gap-2">
                <Mic className="w-3 h-3 text-blue-500 shrink-0" />
                <p className="font-bold text-slate-700 text-sm">"{cmd}"</p>
            </div>
            <p className="text-xs text-slate-400 mt-1 ml-5 font-medium">{desc}</p>
        </div>
    )
}
