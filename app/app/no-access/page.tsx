import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Lock, LogOut, ArrowRight, ShieldCheck } from "lucide-react"

export default async function NoAccessPage() {
    const session = await auth()

    if (session?.user?.emprendeAccess) {
        redirect("/emprende")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl text-center">
                <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
                    <Lock className="w-10 h-10 text-amber-500" />
                </div>

                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Acceso Restringido</h1>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Para usar <span className="text-white font-bold">Emprende</span>, necesitas activar el acceso desde tu panel de
                    <span className="text-[#4379F2] font-bold"> Finanza Fácil</span>.
                </p>

                <div className="space-y-4">
                    <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20 flex items-center gap-4 text-left">
                        <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
                        <div>
                            <p className="text-white text-sm font-bold">Control Centralizado</p>
                            <p className="text-slate-400 text-xs">Gestiona tus permisos y suscripciones en un solo lugar.</p>
                        </div>
                    </div>

                    <form action={async () => {
                        "use server"
                        await signOut({ redirectTo: "/signin" })
                    }}>
                        <button className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                            Cerrar Sesión <LogOut className="w-5 h-5" />
                        </button>
                    </form>

                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold pt-4">
                        Ecosistema Finanza Fácil
                    </p>
                </div>
            </div>
        </div>
    )
}
