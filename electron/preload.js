const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveReturn: (data) => ipcRenderer.invoke('save-return', data),
  loadReturn: () => ipcRenderer.invoke('load-return'),
  exportPDF: (data) => ipcRenderer.invoke('export-pdf', data),
  
  // Platform info
  platform: process.platform,
  
  // Listen for menu events
  onNewReturn: (callback) => ipcRenderer.on('new-return', callback),
  onOpenReturn: (callback) => ipcRenderer.on('open-return', callback),
  onSaveReturn: (callback) => ipcRenderer.on('save-return', callback),
  onExportPDF: (callback) => ipcRenderer.on('export-pdf', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose a secure storage API
contextBridge.exposeInMainWorld('storage', {
  get: (key) => {
    try {
      const data = localStorage.getItem(`taxsimple_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(`taxsimple_${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(`taxsimple_${key}`);
      return true;
    } catch {
      return false;
    }
  },
  clear: () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('taxsimple_'))
        .forEach(key => localStorage.removeItem(key));
      return true;
    } catch {
      return false;
    }
  }
});
