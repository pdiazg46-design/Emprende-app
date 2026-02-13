import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TrendingUp, TrendingDown, Package } from "lucide-react"
import { getDashboardMetrics } from "@/actions/transaction-actions"
import Image from "next/image"
import { VoiceWrapper } from "@/components/voice/VoiceWrapper"
import { InventoryManager } from "@/components/inventory/InventoryManager"
import { HelpGuide } from "@/components/HelpGuide"
import { DesktopLayout } from "@/components/layout/DesktopLayout"
import { RecentActivitySection } from "@/components/RecentActivitySection"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const { salesToday, expensesToday, transactionsToday, totalStockValue, inventory } = await getDashboardMetrics()

  return (
    <DesktopLayout user={session.user}>
      {/* Header Mobile (Solo visible en md:hidden) */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-30 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14">
            <Image
              src="/logo-atsit.png"
              alt="AT-SIT Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">
              Emprende
            </h1>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
          {/* Placeholder Avatar */}
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20" />
        </div>
      </header>

      {/* Ajuste de padding para mobile header */}
      <div className="md:hidden h-16" />

      <div className="space-y-8 max-w-6xl mx-auto">

        {/* Welcome Section (Desktop Only) */}
        <div className="hidden md:block mb-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Hola, {session.user.name?.split(' ')[0]} <span className="text-2xl">👋</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Tu resumen de negocio en tiempo real.</p>
        </div>

        <HelpGuide />

        {/* Resumen Diario & Inventario */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-3 text-emerald-600">
              <div className="p-2 bg-emerald-50 rounded-full">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Ventas Hoy</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ${salesToday.toLocaleString('es-CL')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Gastos Hoy</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ${expensesToday.toLocaleString('es-CL')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-3 text-blue-600">
              <div className="p-2 bg-blue-50 rounded-full">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Inventario Total</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ${(totalStockValue || 0).toLocaleString('es-CL')}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {(inventory?.length || 0)} Productos registrados
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actividad Reciente (Client Component) */}
          <RecentActivitySection transactions={transactionsToday as any} />

          {/* Gestor de Inventario con Tabla */}
          <section className="h-full">
            <InventoryManager inventory={inventory as any} />
          </section>
        </div>
      </div>

      <VoiceWrapper />

    </DesktopLayout>
  )
}
