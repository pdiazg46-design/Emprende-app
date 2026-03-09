'use server'

import { revalidatePath } from 'next/cache'
import { registerExpense, addContribution, deleteMovement, getLastMovementId, updateBudget, addBudgetItem, updatePartnerInfo, getSharedFund } from './fund-actions'
import { prisma } from '@/lib/prisma'

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { auth } from '@/lib/auth'

export async function processVoiceCommand(text: string) {
    if (!text) return { success: false, error: "Texto vacío" }

    if (!process.env.OPENAI_API_KEY) {
        console.error("FALTA OPENAI_API_KEY en Vercel/Local")
        return { success: false, error: "Motor de IA apagado. Falta API Key." }
    }

    console.log(`[V2A-Generative-AI] Ingreso: "${text}"`)

    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "No autorizado." }
    }

    // Paywall de IA: Bloqueo de Costos OpenAI para cuentas Gratuitas (Freemium)
    if (session.user.subscriptionPlan === 'BASIC') {
        return {
            success: false,
            error: "La venta asistida por Voz es exclusiva del Plan Emprende PRO. ¡Cámbiate hoy y libera el poder de la Inteligencia Artificial!"
        }
    }

    try {
        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: z.object({
                intent: z.enum([
                    'SALE', 'MULTI_SALE', 'EXPENSE', 'INVENTORY_ADD', 'INVENTORY_RESTOCK', 'CASH_WITHDRAWAL',
                    'RECORDS_INCOME', 'DELETE_LAST', 'UPDATE_BUDGET', 'UPDATE_PARTNER', 'CALIBRATE_FUND'
                ]).describe("El tipo de operación detectada."),
                amount: z.string().describe("Monto total o cantidad. Siempre devolver como STRING de texto. Ej: '1000', '1', 'un'. Si no aplica, devuelve '0'."),
                paymentMethod: z.enum(['CASH', 'TRANSFER', 'NONE']).describe("Específica CASH o TRANSFER. Si no aplica, devuelve NONE."),
                description: z.string().describe("Descripción limpia para Gastos o Presupuestos. Si no hay, envía ''."),
                productName: z.string().describe("Nombre de producto si es Venta o Inventario. Si no hay, envía ''."),
                isQuantity: z.boolean().describe("True si el número dictado es una cantidad en vez de monetario. Si no aplica, false."),
                items: z.array(z.object({
                    amount: z.string().describe("Cantidad o valor. Siempre como string de texto. Obligatorio llenar con '1' si se omite."),
                    product: z.string().describe("Nombre del producto limpio. Obligatorio llenar."),
                    isQuantity: z.boolean().describe("True si 'amount' es cantidad de items. Asumir true si es producto.")
                })).describe("Usar si hay MULTIPLES productos en una misma oración. Si es uno o nada, enviar array vacío []."),
                price: z.string().describe("Precio unitario. Siempre string. Si no aplica, '0'."),
                installments: z.string().describe("Cantidad de cuotas. Siempre string. Si no aplica, '0'."),
                categoryType: z.enum(['SUBSCRIPTION', 'FIXED_PAGO', 'VARIABLE_SERVICE', 'CONTRIBUTION', 'GENERAL', 'NONE']).describe("Tipo. Usa 'NONE' si no aplica."),
                confidence: z.number().describe("Qué tan seguro estás del intent (0 a 1).")
            }),
            prompt: `
            Eres un asistente financiero ultra-inteligente para Chile. Extrae información en formato exacto.
            Siempre devuelve las cantidades (amount, price) como TEXTO (Strings). Ej: "1", "500", "un", "dos".
            
            Slang/Moneda Chilena:
            - "luca"/"lucas" = 1000. (ej: 40 lucas = 40000). "palo" = 1000000.
            
            Reglas de Intents:
            - SALE: Venta de un producto. Si el usuario NO menciona un número o cantidad (Ej: "vendí barra dubai", "vendí un café"), DEBES asumir obligatoriamente amount="1" e isQuantity=true.
            - MULTI_SALE: Venta de VARIOS productos (Ej: "vendí 2 papas y 1 collar", "vendí un anillo, un collar y dos gorros"). Llena el array 'items'. Aquí también, si dice "y una papa", asume amount="1".
            - EXPENSE: Gastos / Compras que hace el usuario. Llena 'amount' y 'description'.
            - CASH_WITHDRAWAL: Extracciones de dinero. (Ej: "Retiro de plata por 10 lucas", "Saqué 5000 de la caja" -> CASH). (Ej: "Retiré 10000 del banco", "Transferí 5000 a mi cuenta" -> TRANSFER). Llena 'amount' y 'paymentMethod'.
            - INVENTORY_ADD: Creación de un producto en bodega. (Ej: "agrega lápiz a 500 pesos con 10 de stock"). Llena productName, price, y amount (como stock).
            - INVENTORY_RESTOCK: Suma stock a algo existente. (Ej: "llegaron 50 lápices"). Llena productName y amount (cantidad).
            - DELETE_LAST: "borra el ultimo", "eliminar el ultimo registro".
            - RECORDS_INCOME: Dinero entrante general al fondo. Llena amount.
            
            Texto a analizar: "${text}"
            `,
        })

        console.log(`[V2A-Generative-AI] Interpretado:`, object)

        const { intent, amount, description, productName, isQuantity, items, price, installments, categoryType, paymentMethod } = object;

        // NLP Parser para transformar textos chilenos ('un', 'dos', 'luca') a números Reales
        const parseNat = (val: string | number | undefined): number => {
            if (val === undefined || val === null) return 0;
            if (typeof val === 'number') return val;
            const str = val.toString().toLowerCase().trim();
            const words: Record<string, number> = {
                'un': 1, 'una': 1, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
                'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10, 'doce': 12, 'quince': 15,
                'veinte': 20, 'treinta': 30, 'cincuenta': 50, 'cien': 100,
                'luca': 1000, 'lucas': 1000, 'palo': 1000000
            };
            if (words[str]) return words[str];
            const num = parseFloat(str);
            return isNaN(num) ? 1 : num; // Si el modelo se equivocó y metió texto basura, asumimos 1 unidad.
        }

        const cleanAmount = parseNat(amount);
        const cleanPrice = parseNat(price);
        const cleanInst = parseNat(installments);

        // --- 1. INTENTS CONTROLADOS POR EL PADRE (Dashboard/VoiceWrapper) ---
        // Retornamos la estructura estricta que espera VoiceWrapper para ejecutar sus acciones

        if (intent === 'SALE') {
            return { success: true, intent: { type: 'SALE', amount: cleanAmount || 0, product: productName || "Venta General", isQuantity: isQuantity || false } }
        }
        if (intent === 'MULTI_SALE') {
            const safeItems = (items || []).map(i => ({
                amount: parseNat(i.amount),
                product: i.product,
                isQuantity: i.isQuantity !== undefined ? i.isQuantity : true // Tolerancia a omisión IA
            }))
            return { success: true, intent: { type: 'MULTI_SALE', items: safeItems } }
        }
        if (intent === 'EXPENSE') {
            return { success: true, intent: { type: 'EXPENSE', amount: cleanAmount || 0, description: description || "Gasto Automático" } }
        }
        if (intent === 'CASH_WITHDRAWAL') {
            return { success: true, intent: { type: 'WITHDRAWAL', amount: cleanAmount || 0, paymentMethod: paymentMethod || 'CASH', description: "Retiro a Finanza Fácil" } }
        }
        if (intent === 'INVENTORY_ADD') {
            return { success: true, intent: { type: 'INVENTORY_ADD', product: productName || "Nuevo Producto", price: cleanPrice || 0, stock: cleanAmount || 0 } }
        }
        if (intent === 'INVENTORY_RESTOCK') {
            return { success: true, intent: { type: 'INVENTORY_RESTOCK', amount: cleanAmount || 0, product: productName || "Producto" } }
        }

        // --- 2. INTENTS MANEJADOS DIRECTAMENTE POR EL CEREBRO DE FONDO (SharedFund) ---
        // Estos se procesan aquí y retornan un mensaje directo para el Wrapper.

        if (intent === 'DELETE_LAST') {
            const lastId = await getLastMovementId()
            if (lastId) {
                await deleteMovement(lastId)
                revalidatePath('/')
                return { success: true, intent: { type: 'CONFIG', message: "Último movimiento anulado vía Voz." } }
            }
            return { success: false, error: "No hay movimientos para borrar." }
        }

        if (intent === 'RECORDS_INCOME') {
            await addContribution(cleanAmount || 0, 'user-demo')
            revalidatePath('/')
            return { success: true, intent: { type: 'CONTRIBUTION', message: `Gran ingreso de $${cleanAmount} procesado.` } }
        }

        if (intent === 'UPDATE_BUDGET' && description && description !== '') {
            const fund = await getSharedFund()
            const item = fund.budget.find((b: any) => description.toLowerCase().includes(b.name.toLowerCase()))
            if (item) {
                await updateBudget(item.id, { amount: cleanAmount || 0, installments: cleanInst, type: categoryType === 'NONE' ? undefined : categoryType as any })
                revalidatePath('/')
                return { success: true, intent: { type: 'CONFIG', message: `Presupuesto de ${item.name} actualizado.` } }
            } else {
                await addBudgetItem(description, cleanAmount || 0, categoryType === 'NONE' ? 'FIXED_PAGO' : categoryType as any, cleanInst)
                revalidatePath('/')
                return { success: true, intent: { type: 'CONFIG', message: `Nuevo presupuesto: ${description}` } }
            }
        }

        if (intent === 'UPDATE_PARTNER') {
            const fund = await getSharedFund()
            await updatePartnerInfo({ name: fund.partnerName || 'Pareja', contribution: cleanAmount || 0 })
            revalidatePath('/')
            return { success: true, intent: { type: 'CONFIG', message: "Aporte de pareja actualizado." } }
        }

        if (intent === 'CALIBRATE_FUND') {
            const fund = await getSharedFund()
            await prisma.sharedFund.update({ where: { id: fund.id }, data: { balance: cleanAmount || 0 } })
            revalidatePath('/')
            return { success: true, intent: { type: 'CONFIG', message: "Fondo calibrado." } }
        }

        return { success: false, error: "Intención no asimilada por el motor IA." }

    } catch (error: any) {
        console.error("[V2A-Generative-AI] Error:", error?.message || error)
        // Forward the exact inner error if it's schema parsing so we can debug it
        const safeError = error?.message ? `Error IA: ${error.message.substring(0, 100)}` : "Intención no asimilada por el motor IA.";
        return { success: false, error: safeError }
    }
}
