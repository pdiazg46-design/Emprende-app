"use client"

import { useState, useEffect } from "react"
import { DesktopLayout } from "@/components/layout/DesktopLayout"
import { Save, CreditCard, ShieldCheck, Key, ArrowLeft } from "lucide-react"
import { updatePaymentConfig, getPaymentConfig } from "@/actions/user-settings-actions"
import { useRouter } from "next/navigation"

export default function SettingsClient() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [config, setConfig] = useState({
        mpAccessToken: "",
        mpPublicKey: "",
        useSumUp: false,
        acceptsCash: true,
        acceptsMercadoPago: false,
        acceptsTransfer: false,
        bankName: "",
        accountType: "",
        accountNumber: "",
        accountHolder: "",
        accountEmail: ""
    })

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPaymentConfig()
                if (data) {
                    setConfig({
                        mpAccessToken: data.mpAccessToken || "",
                        mpPublicKey: data.mpPublicKey || "",
                        useSumUp: data.useSumUp || false,
                        acceptsCash: data.acceptsCash ?? true,
                        acceptsMercadoPago: data.acceptsMercadoPago ?? false,
                        acceptsTransfer: data.acceptsTransfer ?? false,
                        bankName: data.bankName || "",
                        accountType: data.accountType || "",
                        accountNumber: data.accountNumber || "",
                        accountHolder: data.accountHolder || "",
                        accountEmail: data.accountEmail || ""
                    })
                }
            } catch (e) {
                console.error("Failed to load settings", e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await updatePaymentConfig(config)
            alert("Configuración guardada exitosamente")
            router.refresh()
            router.push("/emprende") // Redirect to main dashboard (correct path)
        } catch (error) {
            alert("Error al guardar")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Cargando...</div>

    return (
        <DesktopLayout user={{ name: "Usuario" }}>
            <div className="space-y-6 max-w-4xl mx-auto pb-20">
                <header className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors md:hidden"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Configuración
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Gestiona tus métodos de pago y preferencias.
                        </p>
                    </div>
                </header>

                <form onSubmit={handleSave} className="space-y-6">

                    {/* 1. MÉTODOS ACTIVOS */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Métodos de Pago Aceptados
                            </h2>
                            <p className="text-xs text-slate-500">Activa o desactiva las opciones disponibles en el POS.</p>
                        </div>
                        <div className="p-6 grid gap-6">
                            {/* Efectivo */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                        $
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Efectivo</p>
                                        <p className="text-xs text-slate-400">Pago en billetes/monedas.</p>
                                    </div>
                                </div>
                                <Toggle checked={config.acceptsCash} onChange={(v) => setConfig({ ...config, acceptsCash: v })} />
                            </div>

                            {/* Mercado Pago */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        MP
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Mercado Pago</p>
                                        <p className="text-xs text-slate-400">Generación de QR automático.</p>
                                    </div>
                                </div>
                                <Toggle checked={config.acceptsMercadoPago} onChange={(v) => setConfig({ ...config, acceptsMercadoPago: v })} />
                            </div>

                            {/* SumUp */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                        S
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">SumUp / Otros</p>
                                        <p className="text-xs text-slate-400">Integración vía App o POS externo.</p>
                                    </div>
                                </div>
                                <Toggle checked={config.useSumUp} onChange={(v) => setConfig({ ...config, useSumUp: v })} />
                            </div>

                            {/* Transferencia */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                        TF
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Transferencia Bancaria</p>
                                        <p className="text-xs text-slate-400">Mostrar datos para transferencia.</p>
                                    </div>
                                </div>
                                <Toggle checked={config.acceptsTransfer} onChange={(v) => setConfig({ ...config, acceptsTransfer: v })} />
                            </div>
                        </div>
                    </div>

                    {/* 2. CONFIGURACIÓN MERCADO PAGO */}
                    {config.acceptsMercadoPago && (
                        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4">
                            <div className="p-6 border-b border-blue-50 bg-blue-50/30">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                    Credenciales Mercado Pago
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Obtén estas llaves en <a href="https://www.mercadopago.cl/developers/panel" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Mercado Pago Developers</a> (Tus integraciones).
                                </p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Public Key</label>
                                    <input
                                        type="text"
                                        value={config.mpPublicKey}
                                        onChange={(e) => setConfig({ ...config, mpPublicKey: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:border-blue-500"
                                        placeholder="TEST-..."
                                        autoComplete="off"
                                        data-form-type="other"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Access Token</label>
                                    <input
                                        type="password"
                                        value={config.mpAccessToken}
                                        onChange={(e) => setConfig({ ...config, mpAccessToken: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:border-blue-500"
                                        placeholder="APP_USR-..."
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. DATOS DE TRANSFERENCIA */}
                    {config.acceptsTransfer && (
                        <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4">
                            <div className="p-6 border-b border-orange-50 bg-orange-50/30">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-orange-600" />
                                    Datos Bancarios
                                </h2>
                                <p className="text-xs text-slate-500">Estos datos se mostrarán al cliente al elegir Transferencia.</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Banco</label>
                                    <input type="text" value={config.bankName} onChange={(e) => setConfig({ ...config, bankName: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Ej: Banco Estado" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Cuenta</label>
                                    <input type="text" value={config.accountType} onChange={(e) => setConfig({ ...config, accountType: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Ej: Cuenta RUT" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Número de Cuenta</label>
                                    <input type="text" value={config.accountNumber} onChange={(e) => setConfig({ ...config, accountNumber: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Ej: 12345678-9" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Titular</label>
                                    <input type="text" value={config.accountHolder} onChange={(e) => setConfig({ ...config, accountHolder: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Nombre completo" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email (para comprobante)</label>
                                    <input type="email" value={config.accountEmail} onChange={(e) => setConfig({ ...config, accountEmail: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="correo@ejemplo.com" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 md:relative md:bg-transparent md:border-none md:p-0 z-10">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-[#4379F2] text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                        </button>
                    </div>

                </form>
            </div>
        </DesktopLayout>
    )
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4379F2]"></div>
        </label>
    )
}
