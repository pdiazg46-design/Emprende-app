const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateSolidIcon(sourcePath, outputDir, fileName, size, paddingPercent = 0.8) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // 1. Fondo Blanco Sólido
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // 2. Cargar imagen original transparente
    const image = await loadImage(sourcePath);

    // 3. Calcular padding para que respire en la barra de tareas
    const drawSize = size * paddingPercent;
    const offset = (size - drawSize) / 2;

    // 4. Dibujar la imagen centrada y escalada
    ctx.drawImage(image, offset, offset, drawSize, drawSize);

    // 5. Guardar
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outputDir, fileName), buffer);
    console.log(`Generado ícono sólido: ${fileName} (${size}x${size})`);
}

async function main() {
    const publicDir = path.join(__dirname, 'public');
    const appDir = path.join(__dirname, 'app');

    // Asumimos que public/logo.png o icon-512.png original sirve de base.
    // Usaremos icon-512.png como fuente transpartente. Si ya lo sobreescribimos, lo recargamos.
    // Pero si ya es opaco se verá igual, vamos a usarlo.
    const sourceImage = path.join(publicDir, 'icon-512.png');

    console.log('Generando íconos de PWA con fondo sólido...');

    // PWA Manifest Icons
    await generateSolidIcon(sourceImage, publicDir, 'icon-192.png', 192, 0.75);
    await generateSolidIcon(sourceImage, publicDir, 'icon-512.png', 512, 0.75);

    // Maskable icons (necesitan estar dentro del "safe zone" circular)
    await generateSolidIcon(sourceImage, publicDir, 'icon-192-maskable.png', 192, 0.65);
    await generateSolidIcon(sourceImage, publicDir, 'icon-512-maskable.png', 512, 0.65);

    // Next.js Root Icons
    await generateSolidIcon(sourceImage, appDir, 'icon.png', 512, 0.75);
    await generateSolidIcon(sourceImage, appDir, 'apple-icon.png', 512, 0.75);

    console.log('¡Íconos re-generados con fondo blanco exitosamente!');
}

main().catch(console.error);
