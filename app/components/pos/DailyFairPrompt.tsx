"use client"

import { useState, useEffect } from "react"
import { Store, X, MapPin, CalendarClock, TrendingUp, History } from "lucide-react"

export function DailyFairPrompt({ isPro }: { isPro: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const [fairName, setFairName] = useState("")
    const [knownFairs, setKnownFairs] = useState<string[]>([])

    useEffect(() => {
        if (!isPro) return;

        try {
            // Cargar ferias conocidas
            const storedFairs = localStorage.getItem('emprende_known_fairs')
            if (storedFairs) {
                setKnownFairs(JSON.parse(storedFairs))
            }

            const today = new Date().toISOString().split('T')[0]
            const lastPrompt = localStorage.getItem('emprende_last_fair_prompt')
            
            if (lastPrompt !== today) {
                // Pequeño delay para no asobrar al usuario apenas abre la app
                const timer = setTimeout(() => {
                    setIsOpen(true)
                }, 1500)
                return () => clearTimeout(timer)
            }
        } catch(e) {}
    }, [isPro])

    if (!isOpen) return null

    const handleConfirm = () => {
        if (!fairName.trim()) {
            alert("Por favor, ingresa el nombre de la feria o evento.")
            return;
        }

        const newFairName = fairName.trim()
        
        // Cargar freshest state de memoria local
        let currentFairs: string[] = []
        try {
            const stored = localStorage.getItem('emprende_known_fairs')
            if (stored) currentFairs = JSON.parse(stored)
        } catch(e) {}

        // Guardar en el historial de ferias (máximo 5)
        const updatedFairs = Array.from(new Set([newFairName, ...currentFairs])).slice(0, 5)
        localStorage.setItem('emprende_known_fairs', JSON.stringify(updatedFairs))
        setKnownFairs(updatedFairs)

        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem('emprende_last_fair_prompt', today)
        localStorage.setItem('current_fair', newFairName)
        window.dispatchEvent(new Event('fairUpdated')) // Notificar a los componentes UI
        setIsOpen(false)
    }

    const handleDismiss = () => {
        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem('emprende_last_fair_prompt', today)
        localStorage.removeItem('current_fair') // Limpiamos la feria de ayer si existía
        window.dispatchEvent(new Event('fairUpdated')) // Notificar a los componentes UI
        setIsOpen(false)
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
            {/* NO onClick en el backdrop para forzar a que interactúen con la UI y no se pierda por accidente */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            
            <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
                <button 
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <Store className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-black text-center text-slate-800 mb-2 leading-tight">
                    ¿Estás vendiendo en una feria hoy?
                </h2>
                
                <p className="text-center text-slate-500 text-sm font-medium mb-6">
                    Activaremos el <span className="text-violet-600 font-bold">Rastreador Inteligente PRO</span> para analizar el rendimiento de este evento especial.
                </p>

                <div className="space-y-4">
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Ej: Mercado de Pulgas, Expo Bazar..."
                            value={fairName}
                            onChange={(e) => setFairName(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 text-sm font-bold rounded-xl py-4 pl-12 pr-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:font-medium placeholder:text-slate-400"
                        />
                    </div>

                    {knownFairs.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {knownFairs.map((fair, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setFairName(fair)}
                                    className="px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-xs font-bold hover:bg-violet-100 transition-colors flex items-center gap-1.5"
                                >
                                    <History className="w-3 h-3" /> {fair}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 mt-2"
                    >
                        <TrendingUp className="w-4 h-4" /> Iniciar ventas y éxito en {fairName ? fairName : 'la feria'}
                    </button>

                    <button
                        onClick={handleDismiss}
                        className="w-full bg-white text-slate-500 font-bold text-xs py-3 rounded-xl border-2 border-slate-100 hover:bg-slate-50 hover:text-slate-700 transition-all uppercase tracking-widest active:scale-95"
                    >
                        No, venta normal
                    </button>
                </div>
            </div>
        </div>
    )
}
