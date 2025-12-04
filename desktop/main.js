import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  let indexPath;

  if (isDev) {
    indexPath = "http://localhost:5173";
    win.loadURL(indexPath);
  } else {
    // Caminho correto para build empacotado
    indexPath = path.join(app.getAppPath(), "dist", "index.html");

    console.log("Index path:", indexPath);
    console.log("Existe?", fs.existsSync(indexPath));

    win.loadFile(indexPath);
  }
}

app.whenReady().then(createWindow);
