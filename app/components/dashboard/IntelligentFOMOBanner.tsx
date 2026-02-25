"use client";

import { useState, useEffect } from "react";
import { Timer, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

interface Props {
    isTrial: boolean;
    daysRemaining: number;
}

export function IntelligentFOMOBanner({ isTrial, daysRemaining }: Props) {
    const [mounted, setMounted] = useState(false);

    // Aseguramos que el componente solo se renderice en el cliente
    // para evitar desfases de hidratación (Hydration Mismatch) con el servidor.
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isTrial) return null;

    const isUrgent = daysRemaining <= 5;

    return (
        <div className="fixed top-[88px] md:top-6 left-1/2 -translate-x-1/2 w-[92%] md:w-auto max-w-md z-[9999] pointer-events-none">
            <div
                className={`pointer-events-auto shadow-2xl rounded-2xl md:rounded-full p-4 md:py-2.5 md:px-5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 border backdrop-blur-xl animate-in slide-in-from-top-10 zoom-in-95 duration-500 ${isUrgent
                        ? "bg-red-600/95 border-red-400 text-white shadow-red-500/30"
                        : "bg-slate-900/95 border-slate-700 text-white shadow-slate-900/20"
                    }`}
            >
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-2">
                        {isUrgent ? (
                            <AlertCircle className="w-5 h-5 text-red-200 animate-pulse" />
                        ) : (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                        )}
                        <h3 className="font-black text-sm tracking-wide uppercase">
                            Prueba Activa
                        </h3>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${isUrgent ? 'bg-red-500/50 border-red-400' : 'bg-white/10 border-white/20'}`}>
                        Quedan {daysRemaining} días
                    </div>
                </div>

                <a
                    href="https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=4cb1a5c9597d4bea924afdc82a1ef778"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all active:scale-95 ${isUrgent
                            ? "bg-white text-red-600 hover:bg-red-50"
                            : "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 border border-white/20"
                        }`}
                >
                    {isUrgent ? "Renovar Ahora" : "Subir a PRO"} <Sparkles className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
}
