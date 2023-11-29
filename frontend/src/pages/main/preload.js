const { contextBridge, ipcRenderer } = require('electron');

// COMMONSHTML
// prettier-ignore
contextBridge.exposeInMainWorld('api', {
  // INVOKE
  loadHeader: () => ipcRenderer.invoke('load-header'),
  getDirname: () => ipcRenderer.invoke('get-dirname'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  testDbConnection: dbSettings => ipcRenderer.invoke('test-db-connection', dbSettings),
  uploadCsv: settings => ipcRenderer.invoke('upload-csv', settings),
  getDirDialog: () => ipcRenderer.invoke('get-dir-dialog'),
  getFileDialog: () => ipcRenderer.invoke('get-file-dialog'),
  startWatchingLogs: () => ipcRenderer.invoke('start-watching-logs'),
  stopWatchingLogs: () => ipcRenderer.invoke('stop-watching-logs'),


  // ON
  onLogEvent: (callback) => ipcRenderer.on('log-event', callback),

});

// prettier-ignore
window.addEventListener("DOMContentLoaded", {
  
});
