const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateJpgIcon(sourcePath, outputDir, fileName, size, paddingPercent = 0.8) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // 1. Fondo Blanco Sólido Obligatorio para JPG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // 2. Cargar imagen original transparente
    const image = await loadImage(sourcePath);

    // 3. Calcular padding para que respire
    const drawSize = size * paddingPercent;
    const offset = (size - drawSize) / 2;

    // 4. Dibujar
    ctx.drawImage(image, offset, offset, drawSize, drawSize);

    // 5. Guardar como formato JPEG sin soporte para Alpha (Transparencia muerta)
    const buffer = canvas.toBuffer('image/jpeg', { quality: 1 });
    fs.writeFileSync(path.join(outputDir, fileName), buffer);
    console.log(`Generado JPEG inquebrantable: ${fileName} (${size}x${size})`);
}

async function main() {
    const publicDir = path.join(__dirname, 'public');

    // Usamos el backup seguro original de atsit (o el nuevo si no tiene blur)
    // Para simplificar, usaremos public/logo.png que estaba limpio originalmente.
    // Si logo.png es el cuadrado, usamos el q hicimos recien q ya tenia fondo blanco:
    const sourceImage = path.join(publicDir, 'icon-512.png'); // Este ya tenia la luna centrada

    console.log('Generando metadatos JPG blindados...');

    // PWA Manifest Icons en JPG
    await generateJpgIcon(sourceImage, publicDir, 'icon-192.jpg', 192, 0.95); // Usamos 0.95 porque el icon-512.png ya traía un padding interno.
    await generateJpgIcon(sourceImage, publicDir, 'icon-512.jpg', 512, 0.95);

    // Maskable icons
    await generateJpgIcon(sourceImage, publicDir, 'icon-192-maskable.jpg', 192, 0.95);
    await generateJpgIcon(sourceImage, publicDir, 'icon-512-maskable.jpg', 512, 0.95);

    console.log('Conversión JPG Terminada.');
}

main().catch(console.error);
