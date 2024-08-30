const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const PhotoManager = require('./src/photoManager');

let mainWindow;
const photoManager = new PhotoManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('save-photo', async (event, name, fileData) => {
  return await photoManager.savePhoto(name, fileData);
});

ipcMain.handle('get-photos', async () => {
  return await photoManager.getPhotos();
});

ipcMain.handle('update-photo', async (event, id, name, fileData) => {
  return await photoManager.updatePhoto(id, name, fileData);
});

ipcMain.handle('delete-photo', async (event, id) => {
  return await photoManager.deletePhoto(id);
});