import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
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
import { PrivacyToggle } from "@/components/PrivacyToggle"
import { SalesCard } from "@/components/dashboard/SalesCard"
import { ExpenseCard } from "@/components/dashboard/ExpenseCard"
import { InventoryCard } from "@/components/dashboard/InventoryCard"
import { RiskManager } from "@/components/dashboard/RiskManager"
import { DemoHeaderBadge } from "@/components/dashboard/DemoHeaderBadge"
import { Suspense } from "react"
import { DailyFairPrompt } from "@/components/pos/DailyFairPrompt"

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
// Mitad Izquierda: Productos y Dashboard
async function DashboardLeft({ session, isTrial, daysRemaining }: { session: any, isTrial: boolean, daysRemaining: number }) {
  const { salesToday, expensesToday, expensesThisWeek, transactionsToday, totalStockValue, inventory } = await getDashboardMetrics()

  return (
    <>
      {/* Header Mobile (Solo visible en md:hidden) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-30 h-16 border-b border-slate-100 flex items-center justify-between px-4">
        {/* Logo Left - AT-SIT */}
        <div className="relative w-16 h-8 shrink-0">
          <Image
            src="/logo-atsit.png"
            alt="AT-SIT Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {/* Title Center - Blue & Absolute */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <h1 className="text-xl font-black text-[#4379F2] uppercase tracking-widest leading-none">
            Emprende
          </h1>
          <DemoHeaderBadge isTrial={isTrial} daysRemaining={daysRemaining} />
        </div>

        <div className="flex items-center gap-2">
          <PrivacyToggle />
          <UserProfile user={session.user} />
        </div>
      </header>

      {/* Ajuste de padding para mobile header */}
      <div className="lg:hidden h-16" />

      <div className="space-y-6 lg:space-y-8 w-full">
        <div className="hidden lg:flex mb-3 items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              Hola, {session.user.name?.split(' ')[0]} <span className="text-2xl">👋</span>
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">Tu resumen de negocio en tiempo real.</p>
          </div>
          {(session.user as any).role === 'ADMIN' && (
            <a href="/admin" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Panel VIP
            </a>
          )}
        </div>



        {/* Resumen Diario & Inventario (Unificado Mobile y Desktop) */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <SalesCard amount={salesToday} />

          <ExpenseCard amount={expensesToday || 0} />

          <InventoryCard
            totalValue={totalStockValue || 0}
            totalItems={inventory?.reduce((acc: any, item: any) => acc + (item.stock || 0), 0) || 0}
            totalProducts={inventory?.length || 0}
            className="col-span-2 md:col-span-1"
          />
        </section>

        <section className="h-full">
          <InventoryManager inventory={inventory as any} />
        </section>
      </div>
    </>
  )
}

// Mitad Derecha: Actividad Reciente
async function DashboardRight() {
  const { transactionsToday } = await getDashboardMetrics()

  return (
    <section className="w-full">
      <RecentActivitySection transactions={transactionsToday as any} />
    </section>
  )
}

export default async function Home() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/signin")
  }

  // 1. Fetch Fresh User Data from DB (Bypass Cached NextAuth Token for Trial Logic)
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { subscriptionPlan: true, subscriptionStatus: true, trialStartsAt: true, createdAt: true, role: true }
  });

  if (!dbUser) {
    redirect("/signin");
  }

  // FOMO Logic calculation (Using Fresh DB Data)
  const subscriptionStatus = dbUser.subscriptionStatus;
  const subscriptionPlan = dbUser.subscriptionPlan;
  const trialStartsAt = dbUser.trialStartsAt || dbUser.createdAt;

  const isTrial = String(subscriptionPlan).toUpperCase() === 'BASIC' && String(subscriptionStatus).toUpperCase() === 'TRIAL';
  let daysRemaining = 0;

  if (isTrial) {
    const startDate = new Date(trialStartsAt);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, 30 - daysSinceStart);
  }

  // Inject fresh Role into session object for the children props safely
  const activeSession = {
    ...session,
    user: {
      ...session.user,
      role: dbUser.role,
      subscriptionPlan: dbUser.subscriptionPlan,
      subscriptionStatus: dbUser.subscriptionStatus,
      trialStartsAt: dbUser.trialStartsAt
    }
  };

  return (
    <DesktopLayout user={activeSession.user}>
      {/* 
        Añadido Suspense: Al hacer revalidatePath("/"), 
        Next.js retorna instántaneamente el Fallback (Skeleton) al cliente,
        permitiendo que el modal de cobro del POS se cierre y se limpie rápido,
        mientras getDashboardMetrics carga la base de datos de forma paralela en el servidor.
      */}
      <div className="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 items-start relative w-full md:max-w-[1400px] md:mx-auto">
        {/* COLUMNA IZQUIERDA (8/12 - 66%) - Productos y Resumen */}
        <div className="md:col-span-8 w-full flex flex-col gap-6 md:gap-8">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardLeft session={activeSession} isTrial={isTrial} daysRemaining={daysRemaining} />
          </Suspense>
        </div>

        {/* COLUMNA DERECHA (4/12 - 33%) - Carrito y Actividad Reciente */}
        <div className="md:col-span-4 w-full flex flex-col gap-6 md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] relative z-50">
          <CartSummary />

          <div className="hidden md:block h-full">
            <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>}>
              <DashboardRight />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Actividad Reciente para Mobile (oculta en md, ya que arriba se muestra en md:block) */}
      <div className="md:hidden w-full mt-6">
        <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>}>
          <DashboardRight />
        </Suspense>
      </div>

      <VoiceWrapper />
      <DailyFairPrompt isPro={activeSession.user.role === 'ADMIN' || activeSession.user.subscriptionPlan === 'PRO'} />
    </DesktopLayout >
  )
}
