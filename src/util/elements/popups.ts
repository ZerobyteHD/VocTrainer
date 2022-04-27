export interface DictionaryEntry {
    content: string;
} 

/**
 * @class Beschreibt das UI Popup für die Definitionsoverlays
 */
export default class UIPopup {
    private readonly parent:HTMLElement;
    private readonly target_element:HTMLElement;
    private readonly title:string;
    private element:HTMLDivElement;
    /**
     * @constructor
     * @param parent Das parent element des Popups
     * @param target_element Das Element, an dem sich das Popup orientieren soll
     * @param title Der Titel des Popups
     */
    constructor(parent:HTMLElement, target_element:HTMLElement, title:string) {
        this.parent = parent;
        this.target_element = target_element;
        this.entry = entry;
        this.title = title;

        // Dem ELement die Klasse "active" geben
        element.classList.toggle("active");

        // Dokumentmaße
        var doc_width = window.innerWidth;
        var doc_height = window.innerHeight;

        // Elementposition und offset
        var el_offset = this.getElementOffset(element);
        var el_pos = element.getBoundingClientRect();
        /*   Pfeilrichtung      Pfeilposition */
        var pos_screen_side_X, pos_screen_side_Y;
        
        // Pfeilrichtung bestimmen
        if(el_pos.left < doc_width/2) {
            pos_screen_side_X = "left";
        } else {
            pos_screen_side_X = "right";
        }

        // Pfeilposition bestimmen
        if(el_pos.top < doc_height/2) {
            pos_screen_side_Y = "top";
        } else {
            pos_screen_side_Y = "bottom";
        }

        var popup = document.createElement("div");
        popup.className = "popup";
        popup.setAttribute("data-arrow-pos", pos_screen_side_Y);
        popup.innerHTML = `<div class="arrow-${pos_screen_side_X}"></div>
        <div onclick="HTMLWikipediaPageViewer.resetOverlays()" class="close-btn">X</div>
        <div class="content">
            <div class="title">${title}</div>
            <div class="loading"><iframe src="../ui/html/splash.html"></iframe></div>
            <div class="entry"></div>
        </div>`;

        popup.style.visibility = "hidden";
        this.element = popup;

        parent.appendChild(popup);

        // BoundingClientRect gibt die aktuelle Position und Größe des Elementes
        var popup_rect = popup.getBoundingClientRect(); // popup rect

        // Anpassung
        var changeX = 0;
        var changeY = 0;
        if(pos_screen_side_X == "left") {
            changeX = element.getBoundingClientRect().width + 20;
        } else {
            changeX = -popup_rect.width - 27;
        }
        if(pos_screen_side_Y == "top") {
            changeY = 5;
        } else {
            changeY = -popup_rect.height + 27;
        }

        // Position
        popup.style.left = Math.max(el_offset.left+changeX, 0)+"px";
        popup.style.top = Math.max(el_offset.top+changeY, 0)+"px";

        // Anzeigen
        popup.style.visibility = "";
    }
    /**
     * Löscht alle overlays
     */
    static resetAll() {
        var old = document.querySelector(".popup");
        if(old)old.remove();
        for(var active_word of document.querySelectorAll(".word.active")) {
            active_word.classList.toggle("active");
        }
    }
    stopLoadingAnimation() {
        this.popup.querySelector(".loading").remove();
    }
    setEntry(entry:DictionaryEntry) {
        this.popup.querySelector(".entry").innerText = entry.content;
        this.stopLoadingAnimation();
    }
}