"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, TrendingDown, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/UserProfile";
import { MobileSimulatorToggle } from "@/components/MobileSimulatorToggle";
import { VoiceToggle } from "@/components/voice/VoiceToggle";

export function DesktopSidebar({ user }: { user: any }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/emprende", icon: LayoutDashboard },
        { name: "Ventas", href: "/emprende/ventas", icon: TrendingUp },
        { name: "Gastos", href: "/emprende/gastos", icon: TrendingDown },
        { name: "Configuración", href: "/emprende/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
            <div className="p-6 border-b border-slate-100 flex flex-col items-center gap-4 text-center">
                <div className="relative h-32 w-auto aspect-square mb-2 mx-auto">
                    <Image
                        src="/logo-atsit.png"
                        alt="AT-SIT"
                        width={128}
                        height={128}
                        className="h-full w-full object-contain"
                        priority
                    />
                </div>
                <div>
                    <h1 className="font-black text-[#4379F2] leading-tight text-xl uppercase tracking-[0.2em] drop-shadow-sm">
                        Emprende
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 tracking-wide mt-1.5">
                        Tu visión, nuestra tecnología
                    </p>
                </div>
            </div>

            <nav className="p-4 space-y-2 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                                isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                            {item.name}
                        </Link>
                    )
                })}

                {/* Mobile Simulator Toggle */}
                <MobileSimulatorToggle />
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">

                {/* Voice Toggle for Quick Access */}
                <div className="flex items-center justify-between px-1 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Modo Voz</span>
                    </div>
                    <VoiceToggle />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <UserProfile user={user} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || "Usuario"}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
