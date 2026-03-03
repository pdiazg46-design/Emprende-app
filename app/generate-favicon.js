const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateZoomedFavicon() {
    const size = 64; // Buen tamaño para alta densidad en favicon
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fondo Blanco Sólido
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const publicDir = path.join(__dirname, 'public');
    const sourceImage = path.join(publicDir, 'icon-512.png');

    // Cargar imagen
    const image = await loadImage(sourceImage);

    // Zoom para matar el padding blanco propio de la imagen original
    // en icon-512.png la luna tenía mucho espacio alrededor.
    // Aplicamos un calibrado exacto de 1.25 para que los bordes toquen la caja sin amputar la luna
    const zoomFactor = 1.25;
    const drawSize = size * zoomFactor;

    // Al aumentar el tamaño, debemos dibujar la imagen con origen negativo 
    // para mantenerla centrada
    const offset = (size - drawSize) / 2;

    ctx.drawImage(image, offset, offset, drawSize, drawSize);

    // Guardar
    const buffer = canvas.toBuffer('image/png', { quality: 1 });
    const outPath = path.join(publicDir, 'favicon-optico.png');
    fs.writeFileSync(outPath, buffer);
    console.log(`Favicon Optico Maxi-Zoom Generado en: ${outPath} (${size}x${size})`);
}

generateZoomedFavicon().catch(console.error);
