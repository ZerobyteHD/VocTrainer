import { HTMLWikipediaSearchViewer, HTMLWikipediaPageViewer } from "./util/api/wikipedia/@elements/viewers";

declare global {
    interface Window {
        HTMLWikipediaPageViewer: any;
        wiki_page:HTMLWikipediaPageViewer;
    }
}


window.HTMLWikipediaPageViewer = HTMLWikipediaPageViewer;

/* Benutzerdefinierte Elemente definieren */
customElements.define("wiki-search-viewer", HTMLWikipediaSearchViewer);
customElements.define("wiki-page-viewer", HTMLWikipediaPageViewer);

function main():void {
    const page = document.querySelector(".cet-container > .content") as HTMLElement;
    const wiki_tab = document.querySelector("#wiki") as HTMLElement;

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