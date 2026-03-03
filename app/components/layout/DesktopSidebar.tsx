"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, TrendingDown, Settings, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/UserProfile";
import { signOut } from "next-auth/react";
import { MobileSimulatorToggle } from "@/components/MobileSimulatorToggle";
import { VoiceToggle } from "@/components/voice/VoiceToggle";

export function DesktopSidebar({ user }: { user: any }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/emprende", icon: LayoutDashboard },
        { name: "Ventas", href: "/emprende/ventas", icon: TrendingUp },
        { name: "Gastos", href: "/emprende/gastos", icon: TrendingDown },
        { name: "Auto F29", href: "/emprende/f29", icon: ShieldCheck },
        { name: "Configuración", href: "/emprende/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
            <div className="p-6 border-b border-slate-100 flex flex-col items-center gap-4 text-center">
                <div className="relative w-40 h-20 mb-2 mx-auto flex items-center justify-center">
                    <Image
                        src="/logo-atsit.png"
                        alt="AT-SIT Logo"
                        width={160}
                        height={80}
                        className="object-contain w-full h-full"
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

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 shrink-0">

                {/* Voice Toggle for Quick Access */}
                <div className="flex items-center justify-between px-1 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Modo Voz</span>
                    </div>
                    <VoiceToggle />
                </div>

                {/* Always-visible Admin and Logout buttons */}
                <div className="flex flex-col gap-2 pb-2">
                    <Link
                        href="/admin"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest text-center shadow-md active:scale-95"
                    >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Admin VIP
                    </Link>

                    <button
                        onClick={async () => {
                            try {
                                await signOut({ redirect: false });
                            } catch (e) {
                                console.error("Error silencioso en signOut sidebar:", e);
                            } finally {
                                window.location.href = "/api/manual-logout";
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest text-center border border-transparent hover:border-red-100 active:scale-95"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-3 w-full">
                        <UserProfile user={user} />
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-bold text-slate-800 truncate mb-0.5">{user?.name || "Usuario"}</p>

                            {user?.subscriptionPlan === 'PRO' ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm mb-1">
                                    PRO VIP
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-600 mb-1">
                                    PLAN BÁSICO
                                </span>
                            )}

                            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
