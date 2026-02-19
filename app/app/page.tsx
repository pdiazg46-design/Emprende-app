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
import { PrivacyToggle } from "@/components/PrivacyToggle"
import { SalesCard } from "../components/dashboard/SalesCard"
import { ExpenseCard } from "../components/dashboard/ExpenseCard"
import { InventoryCard } from "../components/dashboard/InventoryCard"
import { RiskManager } from "../components/dashboard/RiskManager"
import { UserProfile } from "@/components/UserProfile"

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
      <RiskManager />
      {/* Header Mobile (Solo visible en md:hidden) */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-30 h-16 border-b border-slate-100 flex items-center justify-between px-4">
        {/* Logo Left - Bigger */}
        <div className="relative w-24 h-full py-2">
          <Image
            src="/logo-atsit.png"
            alt="AT-SIT Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {/* Title Center - Blue & Absolute */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="text-xl font-black text-[#4379F2] uppercase tracking-widest leading-none">
            Emprende
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <PrivacyToggle />

          {/* User Profile - Right (Google Image - Maximized) */}
          {/* User Profile - Right (Interactive) */}
          <UserProfile user={session.user} />
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



        {/* Resumen Diario & Inventario */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <SalesCard amount={salesToday} />

          <ExpenseCard amount={expensesToday} />

          <InventoryCard
            totalValue={totalStockValue || 0}
            totalItems={inventory?.reduce((acc: any, item: any) => acc + (item.stock || 0), 0) || 0}
            totalProducts={inventory?.length || 0}
            className="col-span-2 md:col-span-1"
          />
        </section>

        <div className="grid grid-cols-1 gap-8">
          {/* Gestor de Inventario con Tabla */}
          <section className="h-full">
            <InventoryManager inventory={inventory as any} />
          </section>

          {/* Actividad Reciente (Client Component) */}
          <RecentActivitySection transactions={transactionsToday as any} />
        </div>
      </div>

      <VoiceWrapper />

    </DesktopLayout>
  )
}
