import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const indexPath = path.join(__dirname, "dist", "index.html");

  // Logar o caminho gerado
  console.log("Index path:", indexPath);

  // Verificar se existe
  console.log("Arquivo existe?", fs.existsSync(indexPath));

  if (!fs.existsSync(indexPath)) {
    console.error("ERRO: index.html não encontrado no caminho esperado!");
  }

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    const indexPath = path.join(__dirname, "dist", "index.html");

    // Logar o caminho gerado
    console.log("Index path:", indexPath);

    // Verificar se existe
    console.log("Arquivo existe?", fs.existsSync(indexPath));

    if (!fs.existsSync(indexPath)) {
      console.error("ERRO: index.html não encontrado no caminho esperado!");
    }

    win.loadFile(indexPath);
  }
}

app.whenReady().then(createWindow);
