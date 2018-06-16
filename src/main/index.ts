import { app, ipcMain, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production';
const windowsById: Map<number, Electron.BrowserWindow | null> = new Map();

const devEntry = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`;
const prodEntry = url.format({
  protocol: 'file',
  pathname: path.join(__dirname, '../renderer/index.html'),
  slashes: true,
});
const entry = isDevelopment ? devEntry : prodEntry;

function createWindow() {
  const window = new BrowserWindow();
  const { id } = window;

  windowsById.set(id, window);
  window.loadURL(entry);
  window.webContents.on('devtools-opened', () => {
    window.focus();
  });

  window.on('closed', () => {
    windowsById.delete(id);
  });
}

app.on('ready', () => {
  createWindow();
  ipcMain.on('window:create', createWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (windowsById.size === 0) {
    createWindow();
  }
});
