const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function createPlaceholder(width, height, outputFileName, text = '') {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fondo oscuro institucional (Slate 900)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Texto o Branding
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Si es Feature Graphic (1024x500)
    if (width === 1024) {
        ctx.font = 'bold 80px Arial';
        ctx.fillText('EMPRENDE', width / 2, height / 2 - 20);
        ctx.font = '40px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('SaaS & POS Ecosystem', width / 2, height / 2 + 50);
    } else {
        // Screenshot proportion
        ctx.font = 'bold 60px Arial';
        ctx.fillText('EMPRENDE', width / 2, height / 2);
        if (text) {
            ctx.font = '40px Arial';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(text, width / 2, height / 2 + 80);
        }
    }

    const buffer = canvas.toBuffer('image/png');
    const outDir = path.join(__dirname, 'public', 'store-assets');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, outputFileName);
    fs.writeFileSync(outPath, buffer);
    console.log(`Creado: ${outputFileName}`);
}

async function main() {
    console.log('Generando material promocional PWA en Escritorio...');
    // Feature Graphic
    await createPlaceholder(1024, 500, 'FeatureGraphic_1024x500.png');

    // Phone Screenshot (1080x1920)
    await createPlaceholder(1080, 1920, 'Phone_Screenshot_1.png', 'Ventas Inmediatas');
    await createPlaceholder(1080, 1920, 'Phone_Screenshot_2.png', 'Gestión de Inventario');

    // Tablet 7 (1200x1920)
    await createPlaceholder(1200, 1920, 'Tablet7_Screenshot_1.png', 'Optimizado para Tablets 7"');

    // Tablet 10 (1600x2560)
    await createPlaceholder(1600, 2560, 'Tablet10_Screenshot_1.png', 'Dashboard B2B 10"');

    console.log('Generaci\u00f3n completada.');
}

main().catch(console.error);
