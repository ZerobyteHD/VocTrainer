import { HTMLWikipediaSearchViewer, HTMLWikipediaPageViewer } from "./util/api/wikipedia/@elements/viewers";
import ConfettiRenderer from "./util/animation/confetti";

declare global {
    interface Window {
        HTMLWikipediaPageViewer: any;
        wiki_page:HTMLWikipediaPageViewer;
        animation_renderer: HTMLCanvasElement;
        test: ConfettiRenderer;
    }
}


window.HTMLWikipediaPageViewer = HTMLWikipediaPageViewer;

/* Benutzerdefinierte Elemente definieren */
customElements.define("wiki-search-viewer", HTMLWikipediaSearchViewer);
customElements.define("wiki-page-viewer", HTMLWikipediaPageViewer);

function main():void {
    const page = document.querySelector(".cet-container > .content") as HTMLElement;
    const cet_container = document.querySelector(".cet-container") as HTMLElement;
    const wiki_tab = document.querySelector("#wiki") as HTMLElement;
    const animation_renderer = document.querySelector("#animation-renderer") as HTMLCanvasElement;
    window.animation_renderer = animation_renderer;

    window.test = new ConfettiRenderer(page, animation_renderer);
    window.test.playFor(5000);

    var wiki_elem = document.createElement("wiki-search-viewer") as HTMLWikipediaSearchViewer;
    wiki_elem.setup();
    wiki_tab.appendChild(wiki_elem);

    window.wiki_page = new HTMLWikipediaPageViewer(page);
    wiki_tab.appendChild(window.wiki_page);
}

/* Ist der Electron Hauptprozess bereit? */
if(window?.DOM_READY) main();
/* sonst auf Event warten */
else document.addEventListener("electron-page-ready", main);