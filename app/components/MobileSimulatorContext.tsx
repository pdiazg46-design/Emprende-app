"use strict";
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface MobileSimulatorContextType {
    isMobileMode: boolean;
    toggleMobileMode: () => void;
}

const MobileSimulatorContext = createContext<MobileSimulatorContextType | undefined>(undefined);

export function MobileSimulatorProvider({ children }: { children: React.ReactNode }) {
    const [isMobileMode, setIsMobileMode] = useState(false);

    // Persist state, but check for iframe to prevent infinite recursion
    useEffect(() => {
        // If we are inside an iframe (window.self !== window.top), FORCE mobile mode off.
        if (typeof window !== "undefined" && window.self !== window.top) {
            setIsMobileMode(false);
            return;
        }

        const saved = localStorage.getItem("mobile-simulator-mode");
        if (saved === "true") setIsMobileMode(true);
    }, []);

    const toggleMobileMode = () => {
        // Prevent toggling if inside iframe
        if (typeof window !== "undefined" && window.self !== window.top) return;

        setIsMobileMode((prev) => {
            const newValue = !prev;
            localStorage.setItem("mobile-simulator-mode", String(newValue));
            return newValue;
        });
    };

    return (
        <MobileSimulatorContext.Provider value={{ isMobileMode, toggleMobileMode }}>
            {children}
        </MobileSimulatorContext.Provider>
    );
}

export function useMobileSimulator() {
    const context = useContext(MobileSimulatorContext);
    if (context === undefined) {
        throw new Error("useMobileSimulator must be used within a MobileSimulatorProvider");
    }
    return context;
}
