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
import { Suspense } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-4 md:p-8 w-full">
      <div className="h-10 bg-slate-200 rounded-xl w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-slate-200 rounded-3xl"></div>
        <div className="h-32 bg-slate-200 rounded-3xl"></div>
        <div className="h-32 bg-slate-200 rounded-3xl"></div>
      </div>
      <div className="h-96 bg-slate-100 rounded-3xl w-full mt-8"></div>
    </div>
  )
}

// Extraído el contenido que bloquea el Time-To-First-Byte
async function DashboardContent({ session, isTrial, daysRemaining }: { session: any, isTrial: boolean, daysRemaining: number }) {
  const { salesToday, expensesToday, expensesThisWeek, transactionsToday, totalStockValue, inventory } = await getDashboardMetrics()

  return (
    <>
      <RiskManager />
      {/* Header Mobile (Solo visible en md:hidden) */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-30 px-4 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="relative w-20 h-20 transition-transform hover:scale-105 active:scale-95 shrink-0">
          <Image
            src="/logo.png"
            alt="AT-SIT Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <h1 className="text-2xl font-black text-[#4379F2] tracking-tight leading-none text-center">Emprende</h1>
          <p className="text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 whitespace-nowrap">Tu visión, nuestra tecnología</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 z-10">
          <UserProfile user={session.user} />
        </div>
      </header>

      {/* Ajuste de padding para mobile header y/o banner FOMO */}
      <div className={`md:hidden ${isTrial ? 'h-40' : 'h-28'}`} />

      {/* FOMO Countdown Banner (Global) */}
      {isTrial && (
        <div className="fixed top-[80px] md:top-6 left-0 right-0 md:left-auto md:right-8 z-50 md:z-[60] bg-gradient-to-r from-rose-500 to-orange-500 text-white px-4 py-3 md:py-2 md:rounded-2xl shadow-lg border border-rose-400/50 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3 md:h-2.5 md:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-white"></span>
            </span>
            <p className="text-xs md:text-[10px] font-black uppercase tracking-wider">
              Prueba Gratuita
            </p>
          </div>
          <p className="text-sm md:text-xs font-bold bg-white/20 px-3 md:px-2 py-1 md:py-0.5 rounded-lg border border-white/20 whitespace-nowrap">
            Quedan {daysRemaining} días
          </p>
        </div>
      )}

      <div className="space-y-8 w-full p-0">
        {/* Welcome Section (Desktop Only) */}
        <div className="hidden md:flex mb-8 items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Hola, {session.user.name?.split(' ')[0]} <span className="text-2xl">👋</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Tu resumen de negocio en tiempo real.</p>
          </div>
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

        {/* Mobile: Vertical List Layout */}
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
          <section className="h-full">
            <InventoryManager inventory={inventory as any} />
          </section>
          <section>
            <RecentActivitySection transactions={transactionsToday as any} />
          </section>
        </div>
      </div>
    </>
  )
}

export default async function Home() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/signin")
  }

  // FOMO Logic calculation
  const subscriptionStatus = (session.user as any).subscriptionStatus;
  const subscriptionPlan = (session.user as any).subscriptionPlan;
  const rawTrialStart = (session.user as any).trialStartsAt;
  const rawCreatedAt = (session.user as any).createdAt;
  let trialStartsAt = rawTrialStart || rawCreatedAt || new Date().toISOString();

  const isTrial = subscriptionPlan === 'BASIC' && subscriptionStatus === 'TRIAL';
  let daysRemaining = 0;

  if (isTrial) {
    const startDate = new Date(trialStartsAt);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, 30 - daysSinceStart);
  }

  return (
    <DesktopLayout user={session.user}>
      {/* 
        Añadido Suspense: Al hacer revalidatePath("/"), 
        Next.js retorna instántaneamente el Fallback (Skeleton) al cliente,
        permitiendo que el modal de cobro del POS se cierre y se limpie rápido,
        mientras getDashboardMetrics carga la base de datos de forma paralela en el servidor.
      */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent session={session} isTrial={isTrial} daysRemaining={daysRemaining} />
      </Suspense>

      <CartSummary />
      <VoiceWrapper />
    </DesktopLayout >
  )
}
