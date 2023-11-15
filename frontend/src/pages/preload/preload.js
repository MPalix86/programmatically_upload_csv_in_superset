const { contextBridge, ipcRenderer } = require('electron');

// COMMONSHTML
contextBridge.exposeInMainWorld('api', {
  loadHeader: () => ipcRenderer.invoke('load-header'),
  getDirname: () => ipcRenderer.invoke('get-dirname'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  testDbConnection: dbSettings =>
    ipcRenderer.invoke('test-db-connection', dbSettings),
});

// prettier-ignore
window.addEventListener("DOMContentLoaded", {
  
});
