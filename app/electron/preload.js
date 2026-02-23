const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getMachineId: () => ipcRenderer.invoke('get-machine-id'),
    on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
});
