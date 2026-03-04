"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// HELPER: Corrector de Zona Horaria para Servidores Vercel (UTC -> UTC-3 Chile)
function getChileTimeBounds(baseDate: Date = new Date()) {
    const tzOffsetHours = 3;
    const chileTime = new Date(baseDate.getTime() - (tzOffsetHours * 60 * 60 * 1000));

    const year = chileTime.getUTCFullYear();
    const month = chileTime.getUTCMonth();
    const date = chileTime.getUTCDate();

    // Medianoche en Chile expresada en horario UTC
    const todayStart = new Date(Date.UTC(year, month, date, tzOffsetHours, 0, 0, 0));

    const currentDay = chileTime.getUTCDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const weekStart = new Date(Date.UTC(year, month, date - diffToMonday, tzOffsetHours, 0, 0, 0));
    const weekEnd = new Date(Date.UTC(year, month, date - diffToMonday + 6, tzOffsetHours + 23, 59, 59, 999));

    const monthStart = new Date(Date.UTC(year, month, 1, tzOffsetHours, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0, tzOffsetHours + 23, 59, 59, 999));

    const yearStart = new Date(Date.UTC(year, 0, 1, tzOffsetHours, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(year, 11, 31, tzOffsetHours + 23, 59, 59, 999));

    // Corrección para "Mes Anterior" con cambio de año
    const lastMonthYear = month === 0 ? year - 1 : year;
    const lastMonthIdx = month === 0 ? 11 : month - 1;

    const lastMonthStart = new Date(Date.UTC(lastMonthYear, lastMonthIdx, 1, tzOffsetHours, 0, 0, 0));
    const lastMonthEnd = new Date(Date.UTC(lastMonthYear, lastMonthIdx + 1, 0, tzOffsetHours + 23, 59, 59, 999));

    // Corrección para "Año Anterior"
    const lastYearStart = new Date(Date.UTC(year - 1, 0, 1, tzOffsetHours, 0, 0, 0));
    const lastYearEnd = new Date(Date.UTC(year - 1, 11, 31, tzOffsetHours + 23, 59, 59, 999));

    return { todayStart, weekStart, weekEnd, monthStart, monthEnd, lastMonthStart, lastMonthEnd, yearStart, yearEnd, lastYearStart, lastYearEnd, chileTime };
}

export async function getFinanceInsights(timeframe: 'today' | 'week' | 'month' | 'last_month' | 'year' | 'last_year' = 'week') {
    const session = await auth()
    if (!session?.user?.id) return null

    try {
        const bounds = getChileTimeBounds();
        let startDate = bounds.weekStart;
        let endDate = bounds.weekEnd;

        if (timeframe === 'today') {
            startDate = bounds.todayStart;
            endDate = new Date(); // now
        } else if (timeframe === 'month') {
            startDate = bounds.monthStart;
            endDate = bounds.monthEnd;
        } else if (timeframe === 'last_month') {
            startDate = bounds.lastMonthStart;
            endDate = bounds.lastMonthEnd;
        } else if (timeframe === 'year') {
            startDate = bounds.yearStart;
            endDate = bounds.yearEnd;
        } else if (timeframe === 'last_year') {
            startDate = bounds.lastYearStart;
            endDate = bounds.lastYearEnd;
        }

        const sales = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                type: 'SALE',
                amount: { gt: 0 },
                NOT: [
                    { description: { contains: 'Añadido', mode: 'insensitive' } },
                    { description: { contains: 'Inventario', mode: 'insensitive' } },
                    { description: { contains: 'stock', mode: 'insensitive' } },
                    { description: { startsWith: 'Repuestos', mode: 'insensitive' } }
                ],
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Agregación de liquidaciones
        let totalCajaEfectivo = 0; // CASH
        let totalBancoTransferencia = 0; // TRANSFER
        let totalVentaSumUp = 0; // SUMUP Bruto
        let totalVentaMP = 0; // MERCADO_PAGO Bruto
        let totalVentaOtros = 0; // null o indefinido (se asume efectivo por compatibilidad antigua)
        let legacyTxCount = 0; // Para alertar a la UI sobre compatibilidad vieja

        // Comisiones fijas (en Chile, promedio para tarjeta de crédito/débito)
        const SUMUP_FEE_RATE = 0.0345; // 2.9% + IVA = 3.45% aprox
        const MP_FEE_RATE = 0.0356; // 2.99% + IVA = 3.56% aprox

        const liquidaciones = sales.map(s => {
            if (!s.paymentMethod) legacyTxCount++;

            const method = s.paymentMethod || 'CASH'; // fallback
            let fee = 0;
            let percent = 0;

            if (method === 'SUMUP') {
                fee = Math.round(s.amount * SUMUP_FEE_RATE);
                percent = SUMUP_FEE_RATE;
                totalVentaSumUp += s.amount;
            } else if (method === 'MERCADO_PAGO') {
                fee = Math.round(s.amount * MP_FEE_RATE);
                percent = MP_FEE_RATE;
                totalVentaMP += s.amount;
            } else if (method === 'TRANSFER') {
                totalBancoTransferencia += s.amount;
            } else if (method === 'CASH') {
                totalCajaEfectivo += s.amount;
            } else {
                totalVentaOtros += s.amount;
            }

            const net = s.amount - fee;

            return {
                id: s.id,
                date: s.createdAt,
                method,
                gross: s.amount,
                fee,
                feePercent: percent * 100,
                net,
                description: s.description
            }
        });

        const sumupFee = Math.round(totalVentaSumUp * SUMUP_FEE_RATE);
        const mpFee = Math.round(totalVentaMP * MP_FEE_RATE);

        const sumupNet = totalVentaSumUp - sumupFee;
        const mpNet = totalVentaMP - mpFee;

        // "Dinero en Banco" = Transferencias Rojas (0%) + MercadoPago Neto + SumUp Neto
        const dineroRealEnBanco = totalBancoTransferencia + mpNet + sumupNet;
        // "Dinero Físico" = Efectivo
        const dineroCajaFisica = totalCajaEfectivo + totalVentaOtros;

        const comisionesCobradas = sumupFee + mpFee;
        const ventaBrutaTotal = totalCajaEfectivo + totalBancoTransferencia + totalVentaSumUp + totalVentaMP + totalVentaOtros;

        return {
            ventaBrutaTotal,
            dineroRealEnBanco,
            dineroCajaFisica,
            comisionesCobradas,
            breakdown: {
                cash: totalCajaEfectivo + totalVentaOtros, // Unificamos legacy con efectivo
                transfer: totalBancoTransferencia,
                sumup: { gross: totalVentaSumUp, fee: sumupFee, net: sumupNet },
                mp: { gross: totalVentaMP, fee: mpFee, net: mpNet },
                legacyCount: legacyTxCount
            },
            history: liquidaciones // para la tabla detallada
        }

    } catch (error) {
        console.error("Error generating finance insights:", error)
        return null
    }
}
