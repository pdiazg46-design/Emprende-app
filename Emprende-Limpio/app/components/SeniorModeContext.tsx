"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SeniorModeContextType {
    isSeniorMode: boolean
    toggleSeniorMode: () => void
}

const SeniorModeContext = createContext<SeniorModeContextType | undefined>(undefined)

export function SeniorModeProvider({ children }: { children: React.ReactNode }) {
    const [isSeniorMode, setIsSeniorMode] = useState(false)

    useEffect(() => {
        // Check localStorage
        const saved = localStorage.getItem("senior-mode")
        if (saved === "true") {
            setIsSeniorMode(true)
            document.documentElement.classList.add("senior-mode")
        }
    }, [])

    const toggleSeniorMode = () => {
        const newState = !isSeniorMode
        setIsSeniorMode(newState)
        localStorage.setItem("senior-mode", String(newState))

        if (newState) {
            document.documentElement.classList.add("senior-mode")
        } else {
            document.documentElement.classList.remove("senior-mode")
        }
    }

    return (
        <SeniorModeContext.Provider value={{ isSeniorMode, toggleSeniorMode }}>
            {children}
        </SeniorModeContext.Provider>
    )
}

export function useSeniorMode() {
    const context = useContext(SeniorModeContext)
    if (!context) {
        throw new Error("useSeniorMode must be used within a SeniorModeProvider")
    }
    return context
}
