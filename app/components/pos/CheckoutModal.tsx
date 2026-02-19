"use client"

import { useState, useEffect } from "react"
import { X, Smartphone, Banknote, CreditCard, CheckCircle2, Loader2 } from "lucide-react"
import { createPaymentPreference } from "@/actions/payment-actions"
import { QRCodeSVG } from 'qrcode.react'; // Need to install this too? Or use an image API? MP returns init_point. 
// MP QR for POS is different. It's a dynamic QR.
// Wait. "init_point" is a Checkout Pro URL.
// For POS QR (scanning to pay), we need to create a "QR Dynamic" via API, or just show the Checkout Pro QR?
// Checkout Pro Link opens a web page.
// If we want "Scan from Phone", effectively showing the QR of the link works.
// Or we can use the "Instore" API (QR).
// Instore API requires creating a "Pos" and "Store" in MP.
// That is complex for a simple "Paste your token" integration.
// EASIEST WAY: Use Checkout Pro "init_point". It opens a page.
// The user (merchant) can click "Pagar con MP" -> Opens browser with MP Checkout?
// Or we render the QR code OF the init_point?
// If I render QR of init_point, user scans, opens checkout on phone, pays.
// Webhook notifies.
// Let's stick to "Generate Link -> Render QR of Link".
// Use `qrcode.react` or just an `img` tag with a QR API.

export function CheckoutModal({ isOpen, onClose, cart, total, onConfirmSale, paymentConfig }: any) {
    const [method, setMethod] = useState<'CASH' | 'MP' | 'SUMUP' | 'TRANSFER'>('CASH')
    const [loading, setLoading] = useState(false)
    const [qrData, setQrData] = useState<string | null>(null)

    // Default to first available method or Cash
    useEffect(() => {
        if (isOpen) {
            setQrData(null)
            setLoading(false)
            if (paymentConfig?.acceptsCash) setMethod('CASH')
            else if (paymentConfig?.acceptsMercadoPago) setMethod('MP')
            else if (paymentConfig?.acceptsSumUp) setMethod('SUMUP')
            else if (paymentConfig?.acceptsTransfer) setMethod('TRANSFER')
            else setMethod('CASH')
        }
    }, [isOpen, paymentConfig])

    if (!isOpen) return null

    const handleConfirm = async () => {
        if (method === 'CASH') {
            onConfirmSale(method)
            onClose()
            return
        }

        if (method === 'SUMUP') {
            if (window.innerWidth < 768) {
                window.location.href = `sumupmerchant://pay/1.0?amount=${total}&currency=CLP&title=Venta%20POS&callback=http://localhost:3000/emprende/pos`
            } else {
                onConfirmSale('SUMUP')
                onClose()
            }
            return
        }

        if (method === 'TRANSFER') {
            onConfirmSale('TRANSFER')
            onClose()
            return
        }

        if (method === 'MP') {
            if (!qrData) {
                generateMPLink()
            } else {
                onConfirmSale('MP')
                onClose()
            }
        }
    }

    const generateMPLink = async () => {
        setLoading(true)
        try {
            const items = cart.map((i: any) => ({
                title: i.name,
                unit_price: i.price,
                quantity: i.quantity
            }))

            const result = await createPaymentPreference(items)
            if (result?.init_point) {
                setQrData(result.init_point)
            }
        } catch (error: any) {
            alert(error.message || "Error al conectar con Mercado Pago")
        } finally {
            setLoading(false)
        }
    }

    // Si no hay configuración (error de carga), mostrar solo Efectivo por seguridad
    const showCash = paymentConfig?.acceptsCash !== false
    const showMP = paymentConfig?.acceptsMercadoPago === true
    const showSumUp = paymentConfig?.useSumUp === true
    const showTransfer = paymentConfig?.acceptsTransfer === true

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h2 className="text-xl font-black text-slate-800">Finalizar Venta</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Cart Details */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-40 overflow-y-auto space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detalle de la compra</p>
                        {cart.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-500">{item.quantity}x</span>
                                    <span className="text-slate-700 truncate max-w-[140px]">{item.name}</span>
                                </div>
                                <span className="font-mono text-slate-900">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total Display */}
                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total a Pagar</p>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter">
                            ${total.toLocaleString('es-CL')}
                        </p>
                    </div>

                    {/* Method Selection */}
                    {!qrData ? (
                        <div className="grid grid-cols-2 gap-3">
                            {showCash && (
                                <button
                                    onClick={() => setMethod('CASH')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'CASH'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-slate-100 hover:border-slate-300 text-slate-500'
                                        }`}
                                >
                                    <Banknote className="w-6 h-6" />
                                    <span className="text-xs font-bold">Efectivo</span>
                                </button>
                            )}

                            {showMP && (
                                <button
                                    onClick={() => {
                                        setMethod('MP')
                                        generateMPLink()
                                    }}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'MP'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-100 hover:border-slate-300 text-slate-500'
                                        }`}
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Smartphone className="w-6 h-6" />}
                                    <span className="text-xs font-bold">Mercado Pago</span>
                                </button>
                            )}

                            {showSumUp && (
                                <button
                                    onClick={() => setMethod('SUMUP')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'SUMUP'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-100 hover:border-slate-300 text-slate-500'
                                        }`}
                                >
                                    <CreditCard className="w-6 h-6" />
                                    <span className="text-xs font-bold">Debito/Credito</span>
                                </button>
                            )}

                            {showTransfer && (
                                <button
                                    onClick={() => setMethod('TRANSFER')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'TRANSFER'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-slate-100 hover:border-slate-300 text-slate-500'
                                        }`}
                                >
                                    <ArrowRightLeft className="w-6 h-6" />
                                    <span className="text-xs font-bold">Transferencia</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4 animate-in zoom-in-95">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <QRCodeSVG value={qrData} size={180} />
                            </div>
                            <p className="text-sm text-slate-500 font-medium text-center px-8">
                                Escanea con la App de Mercado Pago
                            </p>
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={() => setQrData(null)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
                                >
                                    Confirmar Pago
                                </button>
                            </div>
                            <a href={qrData} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 font-bold hover:underline">
                                Abrir Link de Pago
                            </a>
                        </div>
                    )}

                    {/* Transfer Details View */}
                    {method === 'TRANSFER' && !loading && (
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Datos de Transferencia
                            </h3>
                            <div className="space-y-1 text-xs text-orange-900 ml-1">
                                <p><span className="font-bold opacity-70">Banco:</span> {paymentConfig?.bankName || "No configurado"}</p>
                                <p><span className="font-bold opacity-70">Tipo:</span> {paymentConfig?.accountType || ""}</p>
                                <p><span className="font-bold opacity-70">N°:</span> <span className="font-mono font-bold text-sm">{paymentConfig?.accountNumber || "---"}</span></p>
                                <p><span className="font-bold opacity-70">Rut:</span> {paymentConfig?.accountHolder || ""}</p>
                                <p><span className="font-bold opacity-70">Email:</span> {paymentConfig?.accountEmail || ""}</p>
                            </div>

                            <button
                                onClick={handleConfirm}
                                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                            >
                                Confirmar Transferencia
                            </button>
                        </div>
                    )}

                    {/* Confirmation Button for Cash/SumUp */}
                    {(method === 'CASH' || method === 'SUMUP') && (
                        <button
                            onClick={handleConfirm}
                            className={`w-full py-4 rounded-xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${method === 'CASH'
                                    ? 'bg-green-500 text-white shadow-green-500/20 hover:bg-green-600'
                                    : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700'
                                }`}
                        >
                            <Check className="w-6 h-6" />
                            CONFIRMAR VENTA
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
