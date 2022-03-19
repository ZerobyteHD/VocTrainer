import { HTMLWikipediaSearchViewer, HTMLWikipediaPageViewer } from "./util/api/wikipedia/@elements/viewers";
import WiktionaryScraper from "js-wiktionary-scraper";

declare global {
    interface Window {
        HTMLWikipediaPageViewer: any;
        wiki_page:HTMLWikipediaPageViewer;
        scraper:WiktionaryScraper;
    }
}

window.scraper = new WiktionaryScraper();

window.HTMLWikipediaPageViewer = HTMLWikipediaPageViewer;

customElements.define("wiki-search-viewer", HTMLWikipediaSearchViewer);
customElements.define("wiki-page-viewer", HTMLWikipediaPageViewer);

function main():void {
    const page = document.querySelector(".cet-container > .content") as HTMLElement;

    var wiki_elem = document.createElement("wiki-search-viewer") as HTMLWikipediaSearchViewer;
    wiki_elem.setup();
    page.appendChild(wiki_elem);

    window.wiki_page = new HTMLWikipediaPageViewer(page);
    page.appendChild(window.wiki_page);
}

if(window?.DOM_READY) main();
else document.addEventListener("electron-page-ready", main);