"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Helper: Ajuste de Zona Horaria Santiago
function getChileMonthBounds(year: number, month: number) {
    const tzOffsetHours = 3; // Considerando UTC-3 habitual.
    // mes en JS local es 0-index.
    // 0 es Ene, 1 es Feb, etc.
    // Comienzo de mes en Chile UTC-3 = 00:00:00 local -> 03:00:00 UTC
    const monthStart = new Date(Date.UTC(year, month, 1, tzOffsetHours, 0, 0, 0));
    // Fin de mes: día 0 del mes siguiente rescata el último del actual.
    const monthEnd = new Date(Date.UTC(year, month + 1, 0, tzOffsetHours + 23, 59, 59, 999));

    return { monthStart, monthEnd };
}

export async function getF29Data(year: number, month: number) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) throw new Error("User not found")

    if (user.role !== 'ADMIN' && !user.f29Active) {
        throw new Error("Módulo Tributario desactivado para esta cuenta.")
    }

    const { monthStart, monthEnd } = getChileMonthBounds(year, month);

    // 1. Obtener Transacciones del Mes
    const transactions = await prisma.transaction.findMany({
        where: {
            userId: user.id,
            createdAt: { gte: monthStart, lte: monthEnd },
            amount: { gt: 0 },
            NOT: [
                { description: { contains: 'Añadido', mode: 'insensitive' } },
                { description: { contains: 'Inventario', mode: 'insensitive' } },
                { description: { contains: 'stock', mode: 'insensitive' } },
                { description: { startsWith: 'Repuestos', mode: 'insensitive' } }
            ]
        },
        select: { type: true, amount: true, taxDocumentType: true }
    });

    // Constantes Chile
    const IVA_RATE = 0.19;
    const HONORARIO_RATE_2026 = 0.1525; // 15.25% Retención Honorarios
    const PPM_RATE = (user.ppmRate || 1.0) / 100; // Ej: 1% -> 0.01

    // Acumuladores
    let totalVentasBrutas = 0;

    let ivaDebito = 0; // Ventas
    let ivaCredito = 0; // Compras con Factura

    let totalHonorariosBrutos = 0;
    let retencionHonorarios = 0;

    let gastosExentos = 0;
    let gastosSinRespaldo = 0; // Vales

    transactions.forEach(tx => {
        if (tx.type === 'SALE' || tx.type === 'WEB_SALE') {
            // Toda venta en la app se asume Bruta (IVA Incluido)
            totalVentasBrutas += tx.amount;
        } else if (tx.type === 'EXPENSE') {
            const doc = tx.taxDocumentType || 'VALE';
            if (doc === 'FACTURA') {
                // Monto Bruto, sacar IVA Crédito
                const netoGastos = Math.round(tx.amount / (1 + IVA_RATE));
                const iva = tx.amount - netoGastos;
                ivaCredito += iva;
            } else if (doc === 'HONORARIO') {
                // Monto se asume el Total Bruto de la Boleta
                totalHonorariosBrutos += tx.amount;
                retencionHonorarios += Math.round(tx.amount * HONORARIO_RATE_2026);
            } else if (doc === 'FACTURA_EXENTA') {
                gastosExentos += tx.amount;
            } else {
                // VALE u Otros
                gastosSinRespaldo += tx.amount;
            }
        }
    });

    // Cálculos Ventas
    const ventasNetas = Math.round(totalVentasBrutas / (1 + IVA_RATE));
    ivaDebito = totalVentasBrutas - ventasNetas;

    // Cálculo PPM
    const ppmAPagar = Math.round(ventasNetas * PPM_RATE);

    // Sumatoria F29
    // Impuesto Determinado = Débito - Crédito (Si da negativo, es remanente)
    const impuestoDeterminado = ivaDebito - ivaCredito;
    const impuestoAPagar = Math.max(0, impuestoDeterminado); // No se paga negativo, queda a favor.
    const remanenteIva = impuestoDeterminado < 0 ? Math.abs(impuestoDeterminado) : 0;

    // A pagar TGR = IVA (si da positivo) + Retenciones + PPM
    const totalF29Pagar = impuestoAPagar + retencionHonorarios + ppmAPagar;

    return {
        ventasBrutas: totalVentasBrutas,
        ventasNetas,
        ivaDebito,
        ivaCredito,
        impuestoAPagar,
        remanenteIva,
        totalHonorariosBrutos,
        retencionHonorarios,
        gastosSinRespaldo,
        gastosExentos,
        ppmAPagar,
        tasaPpm: user.ppmRate || 1.0,
        totalF29Pagar,
        isDemo: !user.f29Active // Para saber si es SuperAdmin viendo vacios
    }
}
