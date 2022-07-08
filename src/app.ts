import {HTMLWikipediaSearchViewer, HTMLWikipediaPageViewer} from "./util/api/wikipedia/@elements/viewers";
import ConfettiRenderer from "./util/animation/confetti";
import {HTMLTrainerElement, HTMLTrainerMode, HTMLTrainerModeVocabularyScanner, HTMLTrainerElementSelect, HTMLTrainerModeVocabularyQuiz} from "./util/elements/trainer";
import {VocabManager} from "./util/vocabmanager";
import {show_prompt} from "./util/elements/modal_prompt";

declare global {
    interface Window { // window ist eine (im Renderprozess) globale Referenz auf das Browserfenster
        HTMLWikipediaPageViewer: any;
        wiki_page:HTMLWikipediaPageViewer;
        animation_renderer: HTMLCanvasElement;
        test: ConfettiRenderer;
        sql_manager: VocabManager;
        confetti: ConfettiRenderer;
        save_word: Function;
        set_data_table: Function;
        data_table: HTMLDivElement;
        show_prompt: Function;
        prompt_instance: any;
        manual_add_word: Function;
        manual_delete_word: Function;
    }
}


window.HTMLWikipediaPageViewer = HTMLWikipediaPageViewer;
window.sql_manager = new VocabManager();

// Wort speichern
window.save_word = async(word:string, type:string, meaning:string)=>{
    word = Buffer.from(word, "base64").toString("ascii");
    meaning = Buffer.from(meaning, "base64").toString("ascii");
    window.sql_manager.insert(word, null, type, meaning);
    alert("Wort gespeichert");
}

// Html-Tabelle aktualisieren
window.set_data_table = async()=>{
    var html = await window.sql_manager.getTableRepresentation();
    window.data_table.innerHTML = html;
}
window.show_prompt = show_prompt;

// Wort löschen
window.manual_delete_word = async()=>{
    var res = await show_prompt(window.prompt_instance, "Wort löschen", ["Wort"], ["word"]) as any;
    if(res.word) {
        // ist das Wort in der Liste?
        var check = await window.sql_manager.isDuplicate(res.word);
        if(check) {
            // Wort löschen
            window.sql_manager.delete(res.word);
            setTimeout(()=>{
                window.set_data_table();
            }, 1000);
            alert("Wort gelöscht");
        } else {
            alert("Das Wort konnte nicht gefunden werden");
        }
    }
}

/**
 * Wort manuell hinzufügen
 */
window.manual_add_word = async()=>{
    var res = await show_prompt(window.prompt_instance, "Wort hinzufügen", ["Wort", "Übersetzung", "Wortart", "Hinweis"], ["word", "translation", "type", "hint"]) as any;
    if(!res.canceled && res.word) {
        window.sql_manager.insert(res.word, res.translation, res.type, res.hint);
        setTimeout(()=>{
            window.set_data_table();
        }, 1000);
    }
}

/* Benutzerdefinierte Elemente definieren */
customElements.define("wiki-search-viewer", HTMLWikipediaSearchViewer);
customElements.define("wiki-page-viewer", HTMLWikipediaPageViewer);
customElements.define("unused-trainer-mode", HTMLTrainerMode);
customElements.define("vocab-trainer-scanner", HTMLTrainerModeVocabularyScanner);
customElements.define("vocab-trainer", HTMLTrainerElement);
customElements.define("vocab-trainer-selector", HTMLTrainerElementSelect);
customElements.define("vocab-trainer-quiz", HTMLTrainerModeVocabularyQuiz);

// Hauptprozess
async function main():Promise<void> {
    // Deklarierung der Ui-Elemente in Typescript
    const page = document.querySelector(".cet-container > .content") as HTMLElement;
    const cet_container = document.querySelector(".cet-container") as HTMLElement;
    const wiki_tab = document.querySelector("#wiki") as HTMLElement;
    const trainer_tab = document.querySelector("#trainer") as HTMLElement;
    const animation_renderer = document.querySelector("#animation-renderer") as HTMLCanvasElement;
    //@ts-ignore
    window.prompt_instance = M.Modal.init(document.querySelector("#prompt-modal"), {dismissible: false}); // M = MaterializeJS
    window.data_table = document.querySelector("#data-table") as HTMLDivElement;
    window.animation_renderer = animation_renderer;

    /* Confetti Test */
    window.confetti = new ConfettiRenderer(page, animation_renderer);

    var wiki_elem = document.createElement("wiki-search-viewer") as HTMLWikipediaSearchViewer;
    wiki_elem.setup();
    wiki_tab.appendChild(wiki_elem);

    window.wiki_page = new HTMLWikipediaPageViewer(page);
    wiki_tab.appendChild(window.wiki_page);

    /* Trainer */
    var trainer = new HTMLTrainerElement(async ()=>{
        var d = await window.sql_manager.getAll();
        return d;
    }, (data:any)=>{ // Richtig-Callback
        window.confetti.playFor(1000);
        if(data) {
            if(data.end && data.right) {
                alert(`Glückwunsch! ${data.right}/${data.right+data.wrong}`);
            }
        }
    }, (data:any)=>{ // Falsch-Callback
        alert("Leider falsch. Richtige Antwort: "+data);
    });
    trainer.initAsHost();
    trainer_tab.appendChild(trainer);
}

/* Ist der Electron Hauptprozess bereit? */
if(window?.DOM_READY) main();
/* sonst auf Event warten */
else document.addEventListener("electron-page-ready", main);
