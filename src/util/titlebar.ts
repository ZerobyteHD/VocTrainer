/* Definiert die Titelleiste im Hauptfenster */

import { Titlebar, Color } from "custom-electron-titlebar";
import * as path from "path";

declare global {
    interface Window {
        page: HTMLElement;
        titlebar: any;
        DOM_READY: number;
    }
}


const DOM_READY:Event = new Event("electron-page-ready"); // Event, das bescheid gibt, wenn der Render-Prozess das Fenster vollständig geladen hat

window.addEventListener("DOMContentLoaded", () => { // Wird ausgeführt, sobald der Dokumentinhalt geladen ist
    window.titlebar = new Titlebar({
        backgroundColor: Color.fromHex("#474747"),
        itemBackgroundColor: Color.fromHex("#121212"),
        icon: path.join(__dirname, "../../assets/icons/icon_32.png"),
        shadow: true,
        iconSize: 36
    });
    document.dispatchEvent(DOM_READY);
    window.DOM_READY = 1; // Fallback
});