import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

async function main() {
    const text = "vendí un anillo y una bebida"
    console.log("Testing text:", text)
    try {
        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: z.object({
                intent: z.enum([
                    'SALE', 'MULTI_SALE', 'EXPENSE', 'INVENTORY_ADD', 'INVENTORY_RESTOCK', 'CASH_WITHDRAWAL',
                    'RECORDS_INCOME', 'DELETE_LAST', 'UPDATE_BUDGET', 'UPDATE_PARTNER', 'CALIBRATE_FUND'
                ]).describe("El tipo de operación detectada."),
                amount: z.union([z.string(), z.number()]).optional().describe("Monto total principal extraído. Ejemplo: '1000', '1', 'un'. Si no hay monto, envía '0'."),
                paymentMethod: z.enum(['CASH', 'TRANSFER']).optional().describe("Para RETIROS o INGRESOS, especifica si salió/entró a la Caja de Billetes ('CASH') o a la Cuenta de Banco ('TRANSFER')."),
                description: z.string().optional().describe("Descripción limpia para Gastos o nombre del Presupuesto."),
                productName: z.string().optional().describe("Nombre de producto si es Venta o Inventario."),
                isQuantity: z.boolean().optional().describe("True si el número dictado es una cantidad en vez de un valor monetario."),
                items: z.array(z.object({
                    amount: z.union([z.string(), z.number()]).optional().describe("Monto o cantidad del item."),
                    product: z.string().optional().describe("Nombre del producto limpio"),
                    isQuantity: z.boolean().optional().describe("True si 'amount' es cantidad de items")
                })).optional().describe("Solo se usa si hay multiples productos dictados en una misma oración."),
                price: z.union([z.string(), z.number()]).optional().describe("Precio unitario si el usuario esta creando inventario."),
                installments: z.union([z.string(), z.number()]).optional().describe("Cantidad de cuotas."),
                categoryType: z.enum(['SUBSCRIPTION', 'FIXED_PAGO', 'VARIABLE_SERVICE', 'CONTRIBUTION', 'GENERAL', 'NONE']).optional().describe("Tipo."),
                confidence: z.number().optional().describe("Qué tan seguro estás del intent (0 a 1).")
            }),
            prompt: `
            Eres un asistente financiero ultra-inteligente para Chile. Extrae información en formato exacto.
            Siempre devuelve las cantidades (amount, price) como TEXTO (Strings). Ej: "1", "500", "un", "dos".
            
            Reglas de Intents:
            - SALE: Venta de un producto. Si el usuario NO menciona un número o cantidad (Ej: "vendí barra dubai", "vendí un café"), DEBES asumir obligatoriamente amount="1" e isQuantity=true.
            - MULTI_SALE: Venta de VARIOS productos (Ej: "vendí 2 papas y 1 collar", "vendí un anillo, un collar y dos gorros"). Llena el array 'items'. Aquí también, si dice "y una papa", asume amount="1".
            
            Texto a analizar: "${text}"
            `,
        })

        console.log("Result object:", JSON.stringify(object, null, 2))
    } catch (err: any) {
        console.error("AI Error:", err.message || err)
    }
}
main()
