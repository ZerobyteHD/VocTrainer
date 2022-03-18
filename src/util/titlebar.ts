import { Titlebar, Color } from "custom-electron-titlebar";
import * as path from "path";

declare global {
    interface Window {
        page: any;
        titlebar: any;
        DOM_READY: number;
    }
}

/* EVENTS */

const DOM_READY:Event = new Event("electron-page-ready");

window.addEventListener("DOMContentLoaded", () => {
    window.titlebar = new Titlebar({
        backgroundColor: Color.fromHex("#474747"),
        itemBackgroundColor: Color.fromHex("#121212"),
        icon: path.join(__dirname, "../../assets/icons/32.png"),
        shadow: true,
        iconSize: 36
    });
    document.dispatchEvent(DOM_READY);
    window.DOM_READY = 1;
});