"use client"

import { usePrivacyMode } from "./PrivacyContext"
import { Eye, EyeOff } from "lucide-react"

export function PrivacyToggle() {
    const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode()

    return (
        <button
            onClick={togglePrivacyMode}
            className={`
        p-2 rounded-full transition-all duration-300
        ${isPrivacyMode
                    ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }
      `}
            title={isPrivacyMode ? "Mostrar Números" : "Ocultar Números (Privacidad)"}
        >
            {isPrivacyMode ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
    )
}
