const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// Ajustar el entorno para producción
process.env.NODE_ENV = 'production';

// Determinar el directorio de la aplicación Next.js
// En producción (Electron asar), __dirname estará dentro de app.asar/electron
// Necesitamos subir un nivel para encontrar la raíz de la app (donde está .next)
// Dependiendo de cómo electron-builder empaquete, podría estar en ./ o ../
const dev = false;
const hostname = 'localhost';
const port = 3000;

// Intentar localizar el directorio de Next.js
// En desarrollo: ./app
// En producción: resources/app
const dir = path.join(__dirname, '..');

const app = next({ dev, hostname, port, dir });
const handle = app.getRequestHandler();

console.log('Iniciando servidor Next.js en segundo plano...');

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    })
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            // Comunicar al proceso padre (Electron) que estamos listos
            if (process.send) {
                process.send('ready');
            }
        });
}).catch((err) => {
    console.error('Error durante app.prepare():', err);
    process.exit(1);
});
