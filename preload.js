const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePhoto: (name, fileData) => ipcRenderer.invoke('save-photo', name, fileData),
  getPhotos: () => ipcRenderer.invoke('get-photos'),
  updatePhoto: (id, name, fileData) => ipcRenderer.invoke('update-photo', id, name, fileData),
  deletePhoto: (id) => ipcRenderer.invoke('delete-photo', id),
});