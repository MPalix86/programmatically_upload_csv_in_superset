const { contextBridge, ipcRenderer } = require('electron');

// COMMONSHTML
// prettier-ignore
contextBridge.exposeInMainWorld('api', {
  loadHeader: () => ipcRenderer.invoke('load-header'),
  getDirname: () => ipcRenderer.invoke('get-dirname'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  testDbConnection: dbSettings => ipcRenderer.invoke('test-db-connection', dbSettings),
  uploadCsv: settings => ipcRenderer.invoke('upload-csv', settings),
  getDirDialog: () => ipcRenderer.invoke('get-dir-dialog'),
  getFileDialog: () => ipcRenderer.invoke('get-file-dialog'),
  getRandomUuid: () => ipcRenderer.invoke('get-random-uuid'),

});

// prettier-ignore
window.addEventListener("DOMContentLoaded", {
  
});
