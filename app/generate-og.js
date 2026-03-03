const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function createOGImage() {
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fondo oscuro institucional (Slate 900)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Borde inferior sutil (Slate 700 o azul primario)
    ctx.fillStyle = '#3b82f6'; // Azul moderno
    ctx.fillRect(0, height - 10, width, 10);

    // Texto o Branding principal
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 110px Arial';
    ctx.fillText('EMPRENDE', width / 2, height / 2 - 40);

    ctx.font = '45px Arial';
    ctx.fillStyle = '#94a3b8'; // text-slate-400
    ctx.fillText('SaaS & POS Ecosystem', width / 2, height / 2 + 50);

    ctx.font = '30px Arial';
    ctx.fillStyle = '#cbd5e1'; // text-slate-300
    ctx.fillText('Punto de Venta \u2022 Inventario \u2022 Inteligencia Artificial', width / 2, height / 2 + 130);

    const buffer = canvas.toBuffer('image/png');
    const outDir = path.join(__dirname, 'public');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, 'opengraph-image.png');
    fs.writeFileSync(outPath, buffer);
    console.log(`Creado Open Graph Image en: ${outPath}`);
}

createOGImage().catch(console.error);
