"use strict";
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useMobileSimulator } from "@/components/MobileSimulatorContext";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

// Internal component that uses search params
function MobileFrameContent({ children }: { children: React.ReactNode }) {
    const { isMobileMode, toggleMobileMode } = useMobileSimulator();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [iframeSrc, setIframeSrc] = useState<string>("");

    // Update iframe source when path changes
    useEffect(() => {
        if (isMobileMode) {
            const params = searchParams.toString();
            setIframeSrc(`${pathname}${params ? `?${params}` : ''}`);
        }
    }, [pathname, searchParams, isMobileMode]);

    if (!isMobileMode) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 md:p-8 transition-colors duration-300">
            <div className={cn(
                "relative w-[412px] h-[915px] bg-white rounded-[32px] shadow-2xl overflow-hidden border-[6px] border-neutral-900",
                "flex flex-col ring-1 ring-white/10"
            )}>
                {/* Punch-hole Camera simulation (Samsung Style) */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-50 pointer-events-none shadow-inner ring-1 ring-black/10"></div>

                {/* Content Area: IFRAME for true viewport simulation */}
                <div className="flex-1 w-full h-full bg-[#F4F7F9] relative">
                    {iframeSrc && (
                        <iframe
                            src={iframeSrc}
                            className="w-full h-full border-none scrollbar-hide"
                            title="Mobile Simulator"
                        />
                    )}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-neutral-950/20 rounded-full z-50 pointer-events-none"></div>
            </div>

            {/* Label for context */}
            <div className="fixed bottom-4 right-4 text-white/50 text-xs font-mono text-center flex flex-col items-end gap-2">
                <div>
                    <div>MÓVIL SIMULATOR ACTIVE</div>
                    <div className="opacity-50 text-[10px]">True Viewport Mode</div>
                </div>
                <button
                    onClick={toggleMobileMode}
                    className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors border border-zinc-700 hover:border-zinc-600"
                >
                    Volver a PC
                </button>
            </div>
        </div>
    );
}

// Main component that wraps content in Suspense
export function MobileFrame({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<>{children}</>}>
            <MobileFrameContent>{children}</MobileFrameContent>
        </Suspense>
    );
}
