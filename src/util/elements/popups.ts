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
     * @param _parent Das parent element des Popups
     * @param _target_element Das Element, an dem sich das Popup orientieren soll
     * @param _title Der Titel des Popups
     */
    constructor(_parent:HTMLElement, _target_element:HTMLElement, _title:string) {
        this.parent = _parent;
        this.target_element = _target_element;
        this.title = _title;

        UIPopup.resetAll();

        // Dem ELement die Klasse "active" geben
        this.target_element.classList.toggle("active");

        var popup = document.createElement("div");
        popup.className = "popup";
        popup.innerHTML = `<div></div>
        <div onclick="UIPopup.resetAll()" class="close-btn">X</div>
        <div class="content">
            <div class="title">${_title}</div>
            <div class="loading"><iframe src="../../ui/html/splash.html"></iframe></div>
            <div class="entry"></div>
        </div>`;

        popup.style.visibility = "hidden";
        this.element = popup;

        _parent.appendChild(this.element);

        this.adjustBounds();
    }
    adjustBounds() {
        // Dokumentmaße
        var doc_width = window.innerWidth;
        var doc_height = window.innerHeight;

        // Elementposition und offset
        var el_offset = this.getElementOffset(this.target_element);
        var el_pos = this.target_element.getBoundingClientRect();
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


        this.element.setAttribute("data-arrow-pos", pos_screen_side_Y);
        this.element.children[0].className = "arrow-"+pos_screen_side_X;

        // BoundingClientRect gibt die aktuelle Position und Größe des Elements
        var popup_rect = this.element.getBoundingClientRect(); // popup rect

        // Anpassung
        var changeX = 0;
        var changeY = 0;
        if(pos_screen_side_X == "left") {
            changeX = this.target_element.getBoundingClientRect().width + 20;
        } else {
            changeX = 0 -popup_rect.width - 27;
        }
        if(pos_screen_side_Y == "top") {
            changeY = 5;
        } else {
            changeY = -popup_rect.height + 27;
        }

        // Position
        this.element.style.left = Math.max(el_offset.left+changeX, 0)+"px";
        this.element.style.top = Math.max(el_offset.top+changeY, 0)+"px";

        // Anzeigen
        this.element.style.visibility = "";
    }
    getElementOffset(element:HTMLElement) {
        const rect = element.getBoundingClientRect();
        return {
            left: rect.left + this.parent.scrollLeft,
            top: rect.top + this.parent.scrollTop
        }
    }
    /**
     * Löscht alle overlays
     */
    static resetAll() {
        var old = document.querySelector(".popup");
        if(old)old.remove();
        for(var active_word of document.querySelectorAll(".word.active")) {
            active_word.classList.remove("active");
        }
    }
    stopLoadingAnimation() {
        this.element.querySelector(".loading")?.remove();
    }
    setEntry(entry:DictionaryEntry) {
        (this.element.querySelector(".entry") as HTMLDivElement).innerHTML = entry.content;
        this.stopLoadingAnimation();
        this.adjustBounds();
    }
}