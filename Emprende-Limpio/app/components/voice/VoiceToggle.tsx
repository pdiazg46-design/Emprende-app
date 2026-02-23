"use client"

import { useVoicePreferences } from "./VoicePreferencesContext"

export function VoiceToggle() {
    const { isVoiceEnabled, toggleVoice } = useVoicePreferences()

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleVoice();
            }}
            className={`relative w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${isVoiceEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
            title={isVoiceEnabled ? "Desactivar voz" : "Activar voz"}
        >
            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${isVoiceEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    )
}
