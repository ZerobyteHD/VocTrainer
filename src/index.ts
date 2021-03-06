/**
 * Diese Datei ist started den NodeJS-Hauptprozess, siehe package.json
 */

/* Imports */
import {app, BrowserWindow, Menu, Tray, ipcMain, globalShortcut, MenuItem} from "electron";
// @ts-ignore
import {setupTitlebar, attachTitlebarToWindow } from "custom-electron-titlebar/main";
import * as electron from "electron";
import * as path from "path";
import {APPDATA, APPDATA_HELPER} from "./util/appdata-helper";

/* Prozessinfo */
console.log("[STARTUP] dirname="+__dirname);
console.log("Versions: ", process.versions);

/* Prozessargumente */
console.log(process.argv);
var argv_switches = {debug:false, silent:false};
for(var arg of process.argv) {
    if(arg.startsWith("--")) {
        var arg_name = arg.replace(/\-\-/g, "");
        argv_switches[arg_name] = true;
    }
}

const InstanceLock:boolean = app.requestSingleInstanceLock();
const SPLASHSCREEN_DELAY:number = 1000;
const appdata:APPDATA_HELPER = new APPDATA_HELPER("VocTrainer", "data.json");

var mainWin:electron.BrowserWindow;

/**
 * Beendet die App
 */
function QUIT():void {
    BrowserWindow.getAllWindows().forEach(win=>{
        win.eventNames().forEach(en=>{win.removeAllListeners(en)});
        win.close();
    });
}

/**
 * Erstellt die Fenster für die App
 */
function createWindow():void {
    // Fenster für den Ladebildschirm
    var load_splash:BrowserWindow = new BrowserWindow({
        width: 450,
        height: 300,
        frame: false,
        show: false
    });
    // HTML Datei laden
    load_splash.loadFile(path.join(__dirname, "../ui/html/splash.html"));
    load_splash.once("ready-to-show", ()=>{
        // Fenster zeigen, sobald es bereit ist
        load_splash.show();
    });

    // Hauptfenster erstellen
    mainWin = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false
    });

    // Windows Titelleiste
    setupTitlebar();
    attachTitlebarToWindow(mainWin);

    mainWin.loadFile(path.join(__dirname, "../ui/html/app.html"));
    mainWin.once("ready-to-show", ()=>{
        // Wenn bereit, kurz noch warten, dann zeigen
        setTimeout(()=>{
            mainWin.show();
            mainWin.maximize();
            load_splash.destroy();
            if(argv_switches.debug)
                mainWin.webContents.openDevTools({"mode":"detach"});
        }, SPLASHSCREEN_DELAY);
    });

    // App beenden, wenn das Hauptfenster geschlossen wird
    mainWin.on("close", e => {
        e.preventDefault();
        QUIT();
    });

    // Menü ausschalten
    var template:object[] = [];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Überprüfung, ob schon eine Instanz dieser App läuft
if(!InstanceLock) {
    app.quit();
} else {
    // App ist bereit
    app.whenReady().then(createWindow);
}

// app events
app.on("window-all-closed", () => {
    app.quit();
});
app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});