export type VoiceIntent =
    | { type: 'SALE'; amount: number; product?: string; isQuantity?: boolean }
    | { type: 'EXPENSE'; amount: number; description?: string }
    | { type: 'INVENTORY_ADD'; product: string; price?: number; stock?: number }
    | { type: 'INVENTORY_RESTOCK'; amount: number; product: string } // Amount here is Quantity
    | { type: 'MULTI_SALE'; items: { amount: number; product: string; isQuantity: boolean }[] } // New Multi-Item Support
    | { type: 'UNKNOWN'; original: string };

const cleanNumber = (str: string) => {
    return parseInt(str.replace(/[\s$.]/g, ''));
};

const extractAmount = (text: string): { amount: number, remainingText: string } | null => {
    const match = text.match(/(\$?\s?\d+[\d\s.]*)/);
    if (match) {
        const rawNumber = match[0];
        const amount = cleanNumber(rawNumber);
        const remainingText = text.replace(rawNumber, '').trim();
        return { amount, remainingText };
    }
    return null;
};

export function parseVoiceCommand(text: string): VoiceIntent {
    let lower = text.toLowerCase().trim();

    // Helper to convert common number words to digits
    const replaceWordsWithNumbers = (str: string) => {
        const map: Record<string, number> = {
            'un': 1, 'uno': 1, 'una': 1,
            'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
            'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
            'once': 11, 'doce': 12, 'quince': 15, 'veinte': 20,
            'treinta': 30, 'cincuenta': 50, 'cien': 100, 'mil': 1000
        };

        let out = str;
        // Replace whole words only
        Object.entries(map).forEach(([word, num]) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            out = out.replace(regex, num.toString());
        });
        return out;
    };

    lower = replaceWordsWithNumbers(lower);

    const cleanDescription = (desc: string) => {
        return desc
            .replace(/^(de|en|por)\s+/i, '')
            .replace(/\s*pesos?$/i, '')
            .replace(/pesos?/i, '')
            .replace(/\s*unidades?$/i, '')
            .trim();
    };

    // 1. INVENTARIO: CREAR (Prioridad: estructuras específicas)
    if (lower.match(/(?:nuevo|crear|agregar)\s+producto/i)) {
        const amountData = extractAmount(lower);
        if (amountData) {
            // Check for explicit stock: "con 50 unidades" or "stock 50"
            let stock = 0;
            let productText = amountData.remainingText;

            // Regex to find "con X" or "stock X"
            // We look for a number at the end or after "con"/"stock"
            const stockMatch = lower.match(/(?:con|stock)\s+(\d+)/i);
            if (stockMatch) {
                stock = parseInt(stockMatch[1]);
                // Remove the stock part from product name
                productText = productText.replace(new RegExp(`(?:con|stock)\\s+${stockMatch[1]}\\s*(?:unidades|u)?`, 'i'), '');
            }

            let product = productText
                .replace(/(?:nuevo|crear|agregar)\s+producto/i, '')
                .replace(/\s+a\s*$/, '')
                .trim();

            product = cleanDescription(product);

            return {
                type: 'INVENTORY_ADD',
                product: product,
                price: amountData.amount,
                stock: stock
            };
        }
    }

    // 2. INVENTARIO: REPONER / SUMAR (Restock)
    if (lower.match(/(?:reponer|llegaron|sumar stock|agregar a)/i)) {
        const amountData = extractAmount(lower);
        if (amountData) {
            let product = amountData.remainingText
                .replace(/(?:reponer|llegaron|sumar stock|agregar a)/i, '')
                .trim();
            product = cleanDescription(product);

            return {
                type: 'INVENTORY_RESTOCK',
                amount: amountData.amount, // Quantity
                product: product
            };
        }
    }

    // 3. EXTRAER MONTO GLOBAL (Para Ventas y Gastos)
    // NOTE: This might consume the first number it finds, which is tricky for multi-sales if we don't handle them first.
    // However, multi-sales are usually strictly "Sale" type. Let's handle Sale detection first if possible,
    // OR parse broadly.
    // Actually, the previous logic extracted amount global FIRST.
    // For "1 dubai y 3 macizos", extracted amount would be "1".
    // But we need to check constraints.

    // Let's TRY to detect SALE keyword explicitly to enable Multi-Sale parsing.
    if (lower.match(/(?:vend[íi]|vendo|vender|vendio|venta|ingreso|gan[ée])/i)) {
        let content = lower
            .replace(/(?:vend[íi]|vendo|vender|vendio|venta|ingreso|gan[ée])/i, '')
            .trim();

        // CHECK FOR MULTI-ITEM SPLITTERS (" y ", " con ", ",")
        // But only splits if we have multiple number-like structures?
        // Simple heuristic: split by ' y ' or ','
        if (content.match(/\s+(?:y|e|,)\s+/)) {
            const segments = content.split(/\s+(?:y|e|,)\s+/).filter(s => s.trim().length > 0);
            const items: { amount: number; product: string; isQuantity: boolean }[] = [];

            for (const seg of segments) {
                // Determine amount for this segment
                const segAmountData = extractAmount(seg);
                if (segAmountData) {
                    const segProduct = cleanDescription(segAmountData.remainingText);
                    const isQty = segAmountData.amount < 100000; // Asumimos cantidad si es bajo, aunque esto es legacy logic.
                    // En realidad, un multi-sale suele ser por cantidad de productos.
                    // Si digo "1000 pesos de pan", isQuantity = false.
                    // Si digo "3 panes", isQuantity = true.
                    // Mejor mantenemos la logica: < 100 es quantity? No, eso es peligroso para precios bajos.
                    // Pero el usuario dijo "1 dubai", "3 macizos". Son cantidades.

                    items.push({
                        amount: segAmountData.amount,
                        product: segProduct,
                        isQuantity: segAmountData.amount < 1000 // A bit wider threshold or context dependent?
                        // Let's stick to < 100 logic for now or rely on "cleanDescription" not stripping currency
                    });
                } else {
                    // Support "un X", "dos X" handled by replacement earlier.
                    // If no number found, assume 1? Or skip?
                    // Let's assume 1 if there is text.
                    const segProduct = cleanDescription(seg);
                    if (segProduct) {
                        items.push({ amount: 1, product: segProduct, isQuantity: true });
                    }
                }
            }

            if (items.length > 0) {
                return { type: 'MULTI_SALE', items };
            }
        }

        // Single Item Fallback (Normal Flow)
        const amountData = extractAmount(lower);
        if (amountData) {
            const { amount, remainingText } = amountData;
            let product = remainingText
                .replace(/(?:vend[íi]|vendo|vender|vendio|venta|ingreso|gan[ée])/i, '')
                .trim();
            product = cleanDescription(product);

            const isQuantity = amount < 1000; // Increased threshold slightly just in case

            return {
                type: 'SALE',
                amount: amount,
                product: product || (isQuantity ? undefined : "Venta General"),
                isQuantity
            };
        }
    }

    // If no SALE keyword was found, or if it was found but no multi-sale or single-sale could be parsed,
    // then we proceed with the general amount extraction for EXPENSE.
    const amountData = extractAmount(lower);
    if (!amountData) return { type: 'UNKNOWN', original: text };

    const { amount, remainingText } = amountData;

    // 5. GASTOS / COMPRAS
    if (lower.match(/(?:gast[ée]|compr[ée]|gasto|compra|pagu[ée])/i)) {
        let description = remainingText
            .replace(/(?:gast[ée]|compr[ée]|gasto|compra|pagu[ée])/i, '')
            .trim();
        description = cleanDescription(description);

        return {
            type: 'EXPENSE',
            amount: amount,
            description: description || "Gasto General"
        };
    }

    return { type: 'UNKNOWN', original: text };
}
