export type VoiceIntent =
    | { type: 'SALE'; amount: number; product?: string; isQuantity?: boolean }
    | { type: 'EXPENSE'; amount: number; description?: string }
    | { type: 'INVENTORY_ADD'; product: string; price?: number; stock?: number }
    | { type: 'INVENTORY_RESTOCK'; amount: number; product: string } // Amount here is Quantity
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
    const amountData = extractAmount(lower);
    if (!amountData) return { type: 'UNKNOWN', original: text };

    const { amount, remainingText } = amountData;

    // 4. VENTAS
    // Expanded regex to catch "vendo", "vender", "vendio"
    if (lower.match(/(?:vend[íi]|vendo|vender|vendio|venta|ingreso|gan[ée])/i)) {
        let product = remainingText
            .replace(/(?:vend[íi]|vendo|vender|vendio|venta|ingreso|gan[ée])/i, '')
            .trim();
        product = cleanDescription(product);

        const isQuantity = amount < 100;

        return {
            type: 'SALE',
            amount: amount,
            product: product || (isQuantity ? undefined : "Venta General"),
            isQuantity
        };
    }

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
