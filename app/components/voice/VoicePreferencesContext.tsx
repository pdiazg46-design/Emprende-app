"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface VoicePreferencesContextType {
    isVoiceEnabled: boolean;
    toggleVoice: () => void;
}

const VoicePreferencesContext = createContext<VoicePreferencesContextType | undefined>(undefined)

export function VoicePreferencesProvider({ children }: { children: ReactNode }) {
    // Default to true, or load from local storage
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("voice_enabled")
        if (saved !== null) {
            setIsVoiceEnabled(saved === "true")
        }
        setLoaded(true)
    }, [])

    const toggleVoice = () => {
        const newState = !isVoiceEnabled
        setIsVoiceEnabled(newState)
        localStorage.setItem("voice_enabled", String(newState))
    }

    // Always render children to avoid blocking the app
    // We can rely on default 'true' until useEffect syncs with localStorage
    if (!loaded) {
        return <VoicePreferencesContext.Provider value={{ isVoiceEnabled: true, toggleVoice: () => { } }}>{children}</VoicePreferencesContext.Provider>
    }

    return (
        <VoicePreferencesContext.Provider value={{ isVoiceEnabled, toggleVoice }}>
            {children}
        </VoicePreferencesContext.Provider>
    )
}

export function useVoicePreferences() {
    const context = useContext(VoicePreferencesContext)
    if (context === undefined) {
        throw new Error("useVoicePreferences must be used within a VoicePreferencesProvider")
    }
    return context
}
