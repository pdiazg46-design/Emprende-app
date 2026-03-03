const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function createOGImage() {
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Fondo Blanco Corporativo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Cargar logotipo transparente de la luna
    const publicDir = path.join(__dirname, 'public');
    const image = await loadImage(path.join(publicDir, 'icon-512.png'));

    // 3. Dibujar logo centrado y con protección de márgenes de WhatsApp (600x600 centrales)
    const logoSize = 300;
    const logoX = (width - logoSize) / 2;
    const logoY = (height / 2) - 180;
    ctx.drawImage(image, logoX, logoY, logoSize, logoSize);

    // 4. Texto debajo del logo
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 80px Arial';
    ctx.fillText('EMPRENDE', width / 2, height / 2 + 150);

    ctx.font = '35px Arial';
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.fillText('Tu punto de venta y gestión de negocios', width / 2, height / 2 + 220);

    // 5. Borde inferior decorativo azul para anclaje visual
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, height - 12, width, 12);

    // Guardar
    const buffer = canvas.toBuffer('image/png');
    const outPath = path.join(publicDir, 'opengraph-image.png');
    fs.writeFileSync(outPath, buffer);
    console.log(`Creado Open Graph con Ícono en: ${outPath}`);
}

createOGImage().catch(console.error);
