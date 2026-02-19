const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, fork } = require('child_process');
const { machineId } = require('node-machine-id');

let mainWindow;
let serverProcess;

const isDev = !app.isPackaged;

function startServer() {
    // Si estamos en dev y NO se ha forzado el modo PC, salimos (asumiendo 'next dev')
    if (isDev && process.env.FORCE_PC_SERVER !== 'true') return;

    const serverPath = path.join(__dirname, 'start-server.js');
    console.log('Iniciando servidor desde:', serverPath);


    serverProcess = fork(serverPath, [], {
        env: { ...process.env, NODE_ENV: 'production' },
        stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    });

    serverProcess.on('message', (msg) => {
        if (msg === 'ready') {
            console.log('Servidor Next.js listo tras mensaje IPC.');
            if (mainWindow) {
                mainWindow.loadURL('http://localhost:3000');
            }
        }
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
    });
}

function createWindow() {
    startServer();

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        title: "Emprende",
        icon: path.join(__dirname, '../public/favicon.ico'),
    });

    // Handle Machine ID retrieval
    ipcMain.handle('get-machine-id', async () => {
        try {
            const id = await machineId();
            return id;
        } catch (error) {
            console.error("Failed to get machine ID:", error);
            return "UNKNOWN_ID";
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // En producción, esperamos a que el servidor esté listo
        // O cargamos una página de "Cargando..." mientras tanto
        // Por ahora, intentaremos cargar después de un breve delay si el IPC falla
        // Pero idealmente el 'message' handler arriba se encarga.

        // Fallback simple: reintentar conexión
        setTimeout(() => {
            if (mainWindow) mainWindow.loadURL('http://localhost:3000');
        }, 3000);
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (serverProcess) {
        serverProcess.kill();
    }
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

