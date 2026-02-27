import { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { CartSummary } from "../pos/CartSummary";
import { Lock, Sparkles } from "lucide-react";
import { LogoutButton } from "../LogoutButton";

interface DesktopLayoutProps {
    children: ReactNode;
    user: any;
}

export function DesktopLayout({ children, user }: DesktopLayoutProps) {
    const isBasic = user?.subscriptionPlan === 'BASIC';

    return (
        <div className="min-h-screen bg-[#F4F7F9] flex relative">
            <DesktopSidebar user={user} />
            <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300 pb-32 md:pb-8 relative">
                {children}
            </main>
            <CartSummary />

            {/* Desktop Full-Screen Paywall */}
            {isBasic && (
                <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center p-8 overflow-hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

                    {/* Card */}
                    <div className="bg-white rounded-3xl p-10 max-w-2xl w-full shadow-2xl text-center border-t-8 border-violet-500 relative animate-in zoom-in-95 duration-300">
                        {/* Background Sparkles Effect */}
                        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-violet-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-fuchsia-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

                        <div className="relative w-28 h-28 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-500/30 transform -rotate-12">
                            <Lock className="w-14 h-14 text-white transform rotate-12" />
                        </div>

                        <h3 className="text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tight relative z-10">
                            Business Intelligence <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">Premium</span>
                        </h3>
                        <p className="text-slate-600 font-medium text-lg mb-6 leading-relaxed relative z-10 max-w-lg mx-auto">
                            El análisis profundo, los informes integrales y la gestión en <strong>Pantalla Completa (PC)</strong> son exclusivos del <strong className="text-slate-900">Plan Emprende PRO ($9.990/mes)</strong>.
                        </p>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left max-w-md mx-auto relative z-10">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">✓</div>
                                    Panel de Control Extendido para Computadores.
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">✓</div>
                                    Inteligencia de Negocio y Control de Gastos.
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">✓</div>
                                    Amnesia Segura (Reinicio Masivo de BD).
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <a
                                href="https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=4cb1a5c9597d4bea924afdc82a1ef778"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full max-w-md mx-auto py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-[13px] tracking-widest uppercase hover:opacity-90 transition-all shadow-xl shadow-violet-500/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Suscribirme a PRO por $9.990/mes
                            </a>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10 text-xs">
                            <p className="text-slate-400 font-medium">
                                ¿Solo quieres vender? Desliza esta ventana y regresa a tu celular.
                            </p>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
