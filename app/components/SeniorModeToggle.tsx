"use client"

import { useSeniorMode } from "./SeniorModeContext"
import { Eye, EyeOff } from "lucide-react"

export function SeniorModeToggle() {
    const { isSeniorMode, toggleSeniorMode } = useSeniorMode()

    return (
        <button
            onClick={toggleSeniorMode}
            className={`
        fixed bottom-6 right-6 z-50 p-4 rounded-full transition-all duration-300 shadow-xl border border-slate-200
        ${isSeniorMode
                    ? "bg-freedom-yellow text-slate-900 scale-110 ring-4 ring-yellow-400/50"
                    : "bg-white text-slate-400 hover:text-atsit-blue hover:scale-105"
                }
      `}
            title={isSeniorMode ? "Desactivar Modo Senior" : "Activar Modo Senior (Letra Grande)"}
        >
            {isSeniorMode ? <EyeOff className="w-8 h-8" /> : <Eye className="w-6 h-6" />}
        </button>
    )
}
