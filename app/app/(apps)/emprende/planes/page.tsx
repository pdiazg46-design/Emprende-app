import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sparkles, Smartphone, Check, ArrowRight, ShieldCheck, Zap, LineChart, MessageSquare, Briefcase } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function PlanesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/signin")
    }

    const { email } = session.user as any

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />
            <div className="absolute top-40 left-0 -ml-40 w-96 h-96 bg-violet-600 rounded-full blur-[120px] opacity-10 pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                
                <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Pasa al siguiente nivel
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                        Emprende está diseñado para crecer contigo. Elige el plan que mejor se adapte a las necesidades reales de tu negocio.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    
                    {/* Plan Básico */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative flex flex-col hover:-translate-y-1 transition-transform duration-300">
                        <div className="mb-8">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-700">
                                <Smartphone className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Básico</h2>
                            <p className="text-slate-500 font-medium h-12">
                                Perfecto para digitalizar tus ventas hoy mismo sin ataduras.
                            </p>
                            <div className="mt-6 flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900">Pago Único</span>
                            </div>
                            <div className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-black uppercase tracking-wider rounded-lg border border-green-200">
                                Gratis para siempre
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            <FeatureItem text="Punto de Venta Celular Rápido" />
                            <FeatureItem text="Inventario Ilimitado (Control de Stock)" />
                            <FeatureItem text="Asistente de Voz Básico (Vende hablando)" />
                            <FeatureItem text="Control de Medios de Pago (Efectivo, Tarjeta, Transf.)" />
                            <FeatureItem text="Créditos a Clientes (Anotación de Fiados con registro en sistema)" />
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <a
                                href="https://mpago.la/1bobeaX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group"
                            >
                                Adquirir Licencia
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* Plan PRO */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col relative overflow-hidden transform md:-translate-y-4 hover:-translate-y-6 transition-transform duration-300">
                        
                        {/* Glow effect inner */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full blur-[80px] opacity-30 pointer-events-none" />
                        
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[10px] font-black tracking-widest uppercase px-6 py-2 rounded-bl-3xl shadow-lg">
                            Recomendado
                        </div>

                        <div className="mb-8 relative z-10">
                            <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-6 text-violet-400 ring-1 ring-violet-500/30">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">Emprende PRO</h2>
                            <p className="text-slate-400 font-medium h-12">
                                La máquina de hacer dinero. Análisis, rentabilidad extrema y control total.
                            </p>
                            <div className="mt-6 flex items-baseline gap-2">
                                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                                    Suscripción
                                </span>
                            </div>
                            <div className="inline-block mt-3 px-3 py-1 bg-violet-900/50 text-violet-300 text-xs font-black uppercase tracking-wider rounded-lg border border-violet-800 backdrop-blur-sm">
                                Facturación Mensual
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-1 relative z-10">
                            <p className="text-sm font-bold text-slate-300 mb-4 pb-2 border-b border-slate-700/50">Todo lo básico más:</p>
                            <FeatureItem PRO text="Máquina del Tiempo (Análisis de Fechas Libres)" />
                            <FeatureItem PRO text="Modo Feria Inteligente (Métricas aisladas de Eventos)" />
                            <FeatureItem PRO text="Reportes con Inteligencia Artificial" />
                            <FeatureItem PRO text="Control de Gastos Duros y Cálculo de Ganancia Real" />
                            <FeatureItem PRO text="Bóveda Interna (Separación Física vs Digital)" />
                            <FeatureItem PRO text="Auto F29 (Aviso de Impuestos - Próximamente)" />
                            <FeatureItem PRO text="Soporte VIP" />
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-800 relative z-10">
                            <a
                                href="https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=4cb1a5c9597d4bea924afdc82a1ef778"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group shadow-xl shadow-violet-600/25"
                            >
                                Suscribirme a PRO
                                <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Footer Notes */}
                <div className="mt-16 text-center animate-in fade-in duration-700 delay-300">
                    <p className="text-slate-500 font-medium text-sm mb-4">
                        ¿Ya adquiriste un plan y necesitas que te activemos tu cuenta?
                    </p>
                    <a
                        href={`https://wa.me/56912345678?text=Hola,%20ya%20pagué%20el%20plan%20y%20necesito%20activación%20para:%20${email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Avisar pago por WhatsApp
                    </a>
                </div>

            </div>
        </div>
    )
}

function FeatureItem({ text, PRO = false }: { text: string, PRO?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1 rounded-full shrink-0 ${PRO ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-100 text-slate-600'}`}>
                <Check className="w-3.5 h-3.5" />
            </div>
            <span className={`text-sm font-medium leading-snug ${PRO ? 'text-slate-300' : 'text-slate-600'}`}>
                {text}
            </span>
        </div>
    )
}
