"use client"

import { useEffect } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Enviar a Sentry o log console
        console.error("[CRITICAL RENDER ERROR caught by Next.js Boundaries]:", error)
    }, [error])

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50 relative z-50">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl overflow-hidden border border-rose-100">
                <div className="bg-rose-500 p-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest text-center">
                        Error en la Aplicación
                    </h2>
                    <p className="text-rose-100 text-sm mt-2 text-center">
                        Has tropezado con un error no anticipado.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mensaje Técnico</p>
                        <div className="bg-slate-900 rounded-xl p-4 overflow-auto">
                            <p className="font-mono text-sm text-rose-400 font-bold whitespace-pre-wrap word-break">
                                {error.message || "Error desconocido en Client Side"}
                            </p>
                        </div>
                    </div>

                    {error.stack && (
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pila de rastreo (Stack)</p>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto max-h-40">
                                <p className="font-mono text-[10px] text-slate-600 whitespace-pre-wrap break-all">
                                    {error.stack}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                    >
                        <RotateCcw className="w-5 h-5" />
                        RECARGAR MÓDULO AL COMPLETO
                    </button>

                    <button
                        onClick={() => reset()}
                        className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 font-bold text-sm uppercase hover:text-slate-800 transition-colors"
                    >
                        Intentar Recuperar Estado
                    </button>
                </div>
            </div>
        </div>
    )
}
