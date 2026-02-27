import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Lock, Sparkles, Smartphone, ChevronRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function PremiumMobilePaywall() {
    const session = await auth()

    // Si no está logueado, chao
    if (!session?.user) {
        redirect("/signin")
    }

    const { email, name, subscriptionStatus, subscriptionPlan } = session.user as any
    const role = (session.user as any).role

    // Si ya es PRO, Admin, o pagó (Basic Active), no debería estar aquí
    if (role === 'ADMIN' || subscriptionPlan === 'PRO' || subscriptionStatus === 'ACTIVE') {
        redirect("/emprende")
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background effects */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-rose-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-violet-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />

            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative z-10 text-center animate-in slide-in-from-bottom flex flex-col h-full md:h-auto">

                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-rose-500 ring-8 ring-rose-50/50">
                    <Lock className="w-10 h-10" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
                    Tu periodo de prueba ha finalizado
                </h1>

                <p className="text-slate-500 text-sm font-medium mb-8">
                    Hola {name?.split(' ')[0]}, tus 30 días gratuitos han concluido. Para continuar gestionando tus ventas, elige un plan:
                </p>

                <div className="space-y-4">

                    {/* Opción 1: Pago Único Celular */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-slate-800 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl font-mono">
                            Vitalicio
                        </div>
                        <h3 className="font-black text-slate-900 mb-1 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-slate-400" />
                            App Móvil Básica
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 h-12">
                            Usa la aplicación en tu celular para siempre. Sin pagos mensuales ni sorpresas.
                        </p>

                        <a
                            href="https://mpago.la/1bobeaX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs tracking-widest uppercase hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            Pago Único $15.000
                        </a>
                    </div>

                    {/* Opción 2: Upsell PRO */}
                    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border-2 border-violet-200 rounded-2xl p-5 text-left relative shadow-sm">
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl font-mono shadow-md">
                            Recomendado
                        </div>
                        <h3 className="font-black text-violet-900 mb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            Emprende PRO
                        </h3>
                        <p className="text-xs text-violet-700/80 mb-4 h-12">
                            Escritorio PC, Control de Gastos, Inteligencia de Negocio y Soporte VIP.
                        </p>

                        <a
                            href="https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=4cb1a5c9597d4bea924afdc82a1ef778"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-black text-xs tracking-widest uppercase hover:opacity-90 shadow-lg shadow-violet-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            Suscribirme a PRO por $15.000/mes
                        </a>
                    </div>

                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                    <a
                        href={`https://wa.me/56912345678?text=Hola,%20ya%20pagué%20el%20plan%20y%20necesito%20activación%20para:%20${email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 transition-colors"
                    >
                        ¿Ya pagaste y sigues bloqueado? Avísame
                        <ChevronRight className="w-3 h-3" />
                    </a>

                    <a
                        href="/api/manual-logout"
                        className="text-[10px] font-bold text-slate-300 hover:text-slate-500 uppercase tracking-widest underline decoration-slate-200 underline-offset-4"
                    >
                        Cerrar Sesión (Refrescar)
                    </a>
                </div>

            </div>
        </div>
    )
}
