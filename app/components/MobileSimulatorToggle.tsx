"use client";

import { Smartphone } from "lucide-react";
import { useMobileSimulator } from "@/components/MobileSimulatorContext";
import { cn } from "@/lib/utils";

export function MobileSimulatorToggle() {
    const { toggleMobileMode, isMobileMode } = useMobileSimulator();

    // Do not show on mobile device (heuristic)
    // Actually, we are on Desktop mostly.

    return (
        <button
            onClick={toggleMobileMode}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 mt-2",
                isMobileMode
                    ? "bg-purple-50 text-purple-700 shadow-sm"
                    : "text-slate-500 hover:bg-purple-50 hover:text-purple-900"
            )}
        >
            <Smartphone className={cn("w-5 h-5", isMobileMode ? "text-purple-600" : "text-slate-400")} />
            Ver en Móvil
        </button>
    );
}
