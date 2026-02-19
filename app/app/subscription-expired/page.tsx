
import { DesktopLayout } from "@/components/layout/DesktopLayout"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShieldAlert, CreditCard } from "lucide-react"
import { SubscribeButton } from "./SubscribeButton"

export default async function SubscriptionExpiredPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/signin")
    }

    // If somehow an active user gets here, redirect them back
    // (We'll implement the check in layout/middleware later)
    // if (session.user.subscriptionStatus === 'ACTIVE') {
    //     redirect("/emprende")
    // }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-slate-100">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShieldAlert className="w-10 h-10 text-amber-500" />
                </div>

                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                        Suscripción Vencida
                    </h1>
                    <p className="text-slate-500">
                        Para continuar disfrutando de todas las herramientas de
                        <span className="font-bold text-blue-600"> Emprende</span>,
                        necesitas reactivar tu plan.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                    <h3 className="font-semibold text-slate-800 mb-1">Plan Pro</h3>
                    <p className="text-sm text-slate-500 mb-3">Acceso total a POS, Inventario e Informes.</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">$4.990</span>
                        <span className="text-sm text-slate-500">/ mes</span>
                    </div>
                </div>

                <SubscribeButton />

                <p className="text-xs text-slate-400 mt-4">
                    ¿Crees que es un error? <a href="#" className="underline hover:text-slate-600">Contáctanos</a>
                </p>
            </div>

            <div className="mt-8 text-center text-slate-400 text-xs">
                © {new Date().getFullYear()} Emprende App. Todos los derechos reservados.
            </div>
        </div>
    )
}
