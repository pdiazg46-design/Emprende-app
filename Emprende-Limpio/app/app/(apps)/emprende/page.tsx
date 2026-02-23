import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TrendingUp, TrendingDown, Package, ShieldCheck } from "lucide-react"
import { getDashboardMetrics } from "@/actions/transaction-actions"
import Image from "next/image"
import { VoiceWrapper } from "@/components/voice/VoiceWrapper"
import { InventoryManager } from "@/components/inventory/InventoryManager"
import { InventoryGrid } from "@/components/inventory/InventoryGrid"
import { HelpGuide } from "@/components/HelpGuide"
import { DesktopLayout } from "@/components/layout/DesktopLayout"
import { RecentActivitySection } from "@/components/RecentActivitySection"
import { CartSummary } from "@/components/pos/CartSummary"
import { UserProfile } from "@/components/UserProfile"
import { SalesCard } from "@/components/dashboard/SalesCard"
import { ExpenseCard } from "@/components/dashboard/ExpenseCard"
import { InventoryCard } from "@/components/dashboard/InventoryCard"
import { RiskManager } from "@/components/dashboard/RiskManager"


// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/signin")
  }

  // if (!session?.user?.emprendeAccess) {
  //   redirect("/no-access")
  // }

  const { salesToday, expensesToday, expensesThisWeek, transactionsToday, totalStockValue, inventory } = await getDashboardMetrics()

  return (
    <DesktopLayout user={session.user}>
      <RiskManager />
      {/* Header Mobile (Solo visible en md:hidden) */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-30 px-4 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm transition-all duration-300">

        {/* Logo (Left, Bigger) */}
        <div className="relative w-20 h-20 transition-transform hover:scale-105 active:scale-95 shrink-0">
          <Image
            src="/logo.png"
            alt="AT-SIT Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {/* Title (Absolute Center) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <h1 className="text-2xl font-black text-[#4379F2] tracking-tight leading-none text-center">
            Emprende
          </h1>
          <p className="text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 whitespace-nowrap">
            Tu visión, nuestra tecnología
          </p>
        </div>

        {/* User Profile (Right) */}
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 z-10">
          <UserProfile user={session.user} />
        </div>
      </header>

      {/* Ajuste de padding para mobile header */}
      <div className="md:hidden h-28" />

      <div className="space-y-8 w-full p-0">

        {/* Welcome Section (Desktop Only) */}
        <div className="hidden md:flex mb-8 items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Hola, {session.user.name?.split(' ')[0]} <span className="text-2xl">👋</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Tu resumen de negocio en tiempo real.</p>
          </div>

          {/* Admin Fast Access (Desktop) */}
          {(session.user as any).role === 'ADMIN' && (
            <a href="/admin" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Panel VIP
            </a>
          )}
        </div>

        {/* Admin Fast Access (Mobile) - Just below header */}
        <div className="md:hidden mb-6 flex justify-center">
          {(session.user as any).role === 'ADMIN' && (
            <a href="/admin" className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-slate-900/20 active:scale-95 transition-transform w-full justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ingresar a Consola VIP
            </a>
          )}
        </div>



        {/* Resumen Diario & Inventario */}
        {/* Resumen Diario & Inventario */}
        {/* Resumen Diario (Pills) & Inventario (Grid) */}

        {/* Mobile: Vertical List Layout (No Horizontal Scroll) */}
        <section className="grid grid-cols-1 gap-3 md:hidden">
          <SalesCard amount={salesToday} variant="mobile-horizontal" />

          <ExpenseCard amount={expensesThisWeek || 0} variant="mobile-horizontal" />

          <InventoryCard
            totalValue={totalStockValue || 0}
            totalItems={inventory?.reduce((acc: any, item: any) => acc + (item.stock || 0), 0) || 0}
            totalProducts={inventory?.length || 0}
            variant="mobile-horizontal"
          />
        </section>

        {/* Desktop: Old Cards Layout */}
        <section className="hidden md:grid md:grid-cols-3 gap-6">
          <SalesCard amount={salesToday} />

          <ExpenseCard amount={expensesThisWeek || 0} />

          <InventoryCard
            totalValue={totalStockValue || 0}
            totalItems={inventory?.reduce((acc: any, item: any) => acc + (item.stock || 0), 0) || 0}
            totalProducts={inventory?.length || 0}
          />
        </section>


        <div className="flex flex-col gap-8">
          {/* Gestor de Inventario: Usa SIEMPRE la Tabla (InventoryManager) y va arriba */}
          <section className="h-full">
            <InventoryManager inventory={inventory as any} />
          </section>

          {/* Actividad Reciente (Abajo) */}
          <section>
            <RecentActivitySection transactions={transactionsToday as any} />
          </section>
        </div>
      </div>

      <CartSummary />
      <VoiceWrapper />

    </DesktopLayout >
  )
}
