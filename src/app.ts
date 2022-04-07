import { HTMLWikipediaSearchViewer, HTMLWikipediaPageViewer } from "./util/api/wikipedia/@elements/viewers";
import ConfettiRenderer from "./util/animation/confetti";
import {HTMLTrainerElement, HTMLTrainerMode, HTMLTrainerModeVocabularyScanner} from "./util/elements/trainer";

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
customElements.define("unused-trainer-mode", HTMLTrainerMode);
customElements.define("vocab-trainer-scanner", HTMLTrainerModeVocabularyScanner);
customElements.define("vocab-trainer", HTMLTrainerElement);

function main():void {
    const page = document.querySelector(".cet-container > .content") as HTMLElement;
    const cet_container = document.querySelector(".cet-container") as HTMLElement;
    const wiki_tab = document.querySelector("#wiki") as HTMLElement;
    const trainer_tab = document.querySelector("#trainer") as HTMLElement;
    const animation_renderer = document.querySelector("#animation-renderer") as HTMLCanvasElement;
    window.animation_renderer = animation_renderer;

    /* Confetti */
    window.test = new ConfettiRenderer(page, animation_renderer);
    window.test.playFor(5000);

    var wiki_elem = document.createElement("wiki-search-viewer") as HTMLWikipediaSearchViewer;
    wiki_elem.setup();
    wiki_tab.appendChild(wiki_elem);

    window.wiki_page = new HTMLWikipediaPageViewer(page);
    wiki_tab.appendChild(window.wiki_page);

    /* Trainer */
    var trainer = new HTMLTrainerElement([{word:"test",translation:"_test"}]);
    trainer.setMode("scanner");
    trainer_tab.appendChild(trainer);
}

/* Ist der Electron Hauptprozess bereit? */
if(window?.DOM_READY) main();
/* sonst auf Event warten */
else document.addEventListener("electron-page-ready", main);