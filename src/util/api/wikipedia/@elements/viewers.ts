import wiki from "wikijs";
import fetch from "node-fetch";
import WiktionaryScraper, { WiktionaryDataResult } from "js-wiktionary-scraper";

const wiki_api = new WiktionaryScraper();

declare global {
    interface Window {
        data:WiktionaryDataResult;
    }
}

async function wiki_get_image(src:string) {
    const parser = new DOMParser();
    var res = await fetch(src);
    var html = await res.text();
    var doc = parser.parseFromString(html, "text/html");
    var url = doc.querySelector(".fullMedia .internal")?.getAttribute("href");
    if(!url?.startsWith("https")) {
        url = url.replace("//","https://");
    }
    return url;
}

/**
 * HTML-Element zur visualisierung einer Suche auf Wikipedia
 */
export class HTMLWikipediaSearchViewer extends HTMLElement {
    _wiki:any; // Wiki Such-API
    max_results:number; // Maximalanzahl der Ergebnisse
    input:HTMLInputElement|null; // Das HTML-Input-Element
    preview:any;
    intervall:number;
    constructor() {
        super();
        this._wiki = wiki();
        this.max_results = 5;
        this.input = null;
        this.preview = null;
        this.intervall = 0;
    }
    async setup() {
        var div = document.createElement("div");
        div.className = "search-container";

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.placeholder = "Auf Wikipedia.org suchen...";
        div.appendChild(this.input);

        this.preview = document.createElement("div");
        this.preview.className = "preview-container";
        div.appendChild(this.preview);

        this.input.addEventListener("input", async()=>{

            window.clearTimeout(this.intervall);
            this.intervall = window.setTimeout(async()=>{
                var query = this.input?.value;
                if(query == "")return;

                var response:object = await this._wiki.search(query);
                var full_res:Array<string> = response["results"];

                var res:Array<string> = full_res.splice(0, this.max_results);

                this.preview.innerHTML = "";

                for(var page of res) {
                    var div2 = document.createElement("div");
                    div2.className = "wiki-search-result";
                    div2.innerHTML = `<a href="javascript:window.wiki_page.load('${page}')">${page}</a>`;
                    this.preview.appendChild(div2);
                }
            }, 1000);
        });

        this.appendChild(div);
        
    }
}

/**
 * HTML-Element zur Darstellung einer Wikipediaseite
 */
export class HTMLWikipediaPageViewer extends HTMLElement {
    _wiki:any; // Wiki-API
    __title:string; // Titel
    parent:HTMLElement; // Elternelement
    word_onclick:(this: HTMLDivElement, ev: MouseEvent) => any; // Onclick-Event, wenn man auf ein Wort klickt
    constructor(parent:HTMLElement) {
        super();
        this._wiki = wiki();
        this.__title = "";
        this.parent = parent;
        this.word_onclick = async(e:any)=>{
            // geklicktes Element hat die Klasse "word"
            if(e.target.className == "word") {
                // Suche nach dem Text des Wortelementes
                var data:WiktionaryDataResult = await wiki_api.fetchData(e.target.innerText);
                // Daten werden zwischengespeichert (für Debugging)
                window.data = data;
                // Ist ein Fehler aufgetreten?
                if(data.error) {
                    // Wenn ja, wurde keine Defintion gefunden
                    this.createPopup(parent, e.target, {content:"Keine Definitionen gefunden"}, e.target.innerText);
                } else {
                    // Wenn nicht:
                    var html = "";
                    // Wenn es Bilder zu diesem Wort gibt, werden diese in das Popup eingebaut
                    if(data.images) {
                        html += `<div class="dict-images">`;
                        for(var image of data.images) {
                            var img_url = await wiki_get_image("https://en.wiktionary.org"+image.url);
                            html += `<img src="${img_url}" alt="${image.caption}" title="${image.caption}">`;
                        }
                        html += "</div>";
                    }
                    // Bedeutungen
                    if(data.meanings)
                    for(var type in data.meanings) {
                        var type_data = data.meanings[type];
                        if(!type_data)continue;

                        html += `<b class="dict-word-title">As ${type.replace("_"," ")}</b><br><div class="meaning-container">`;
                        html += `<b class="dict-meaning-head">${type_data.head}</b><br><br>`;
                        for(var meaning of type_data.meanings) {
                            html += `<span class="dict-meaning-text">${meaning.text}</span><br>`;
                            if(meaning.example) {
                                html += `<span class="dict-example">➔ </span><i>${meaning.example}</i><br><br>`;
                            }
                        }
                        html += "</div>";
                    }
                    // Popup zeigen
                    this.createPopup(parent, e.target, {content: html}, e.target.innerText);

                    /**
                     * Fehlt:
                     * Pronunciation, IPA
                     */
                }
            }
        }

        window.addEventListener("resize", ()=>{
            // Wenn die Größe des Fensters verändert wird, werden alle Overlays entfernt
            // Grund: Implementierung einer Anpassung zu aufwändig
            HTMLWikipediaPageViewer.resetOverlays();
        });
    }
    /**
     * Konvertiert einen String zu einem HTML String mit "spans"
     * @param content Zu konvertierender String
     * @returns HTML String mit Span-Elementen
     */
    static contentToWords(content:string):string {
        var wordRegex = /([a-zA-Z\'\-]{1,})/g;
        return content.replace(wordRegex, "<span class='word'>$1</span>");
    }
    /**
     * Entfernt alle Overlays (Popups)
     */
    static resetOverlays() {
        var old = document.querySelector(".popup");
        if(old)old.remove();
        // @ts-ignore
        for(var active_word of document.querySelectorAll(".word.active")) {
            active_word.classList.toggle("active");
        }
    }
    /**
     * Umhüllt eine HTML-Text-Node mit einem Span-Element
     * @param textNode 
     */
    static wrapTextNode(textNode:Node) {
        var spanNode = document.createElement("div");
        spanNode.className = "word-group";
        spanNode.innerHTML = this.contentToWords(textNode.textContent as string);
        (textNode.parentNode as HTMLElement).replaceChild(spanNode, textNode);
    }
    /**
     * Rekursive Konvertierung von Text-Nodes als Kindelement von element zu Span-Elementen
     * @param element Startelement
     * @returns undefined
     */
    static recursiveHtmlToWords(element:HTMLElement):void {
        if(!element)return;
        if(element.childNodes) {
            // @ts-ignore
            for(var child_node of element.childNodes) {
                if(child_node.nodeType == 3) {
                    this.wrapTextNode(child_node);
                } else {
                    if(child_node.tagName) {
                        this.recursiveHtmlToWords(child_node);
                    }
                }
            }
        }
    }
    static htmlToWords(raw_html:string):string {
        // "//" -> "https://"
        raw_html = raw_html.replace(/((?:srcset|src)=")(\/\/)/g, "$1https://");

        // wiki-links -> window.wiki_page.load
        raw_html = raw_html.replace(/href="\/wiki\/([a-zA-Z_-]{1,})"/g, `href="javascript:window.wiki_page.load('$1')"`);

        var div = document.createElement("div");
        div.innerHTML = raw_html;
        this.recursiveHtmlToWords(div);
        return div.innerHTML;
    }
    /**
     * Erzeugt ein Popup
     * @param parent Elternelement
     * @param element Das Element, an dem sich das Popup orientieren soll
     * @param entry ungenutzt
     * @param title ungenutzt
     */
    createPopup(parent:HTMLElement, element:HTMLElement, entry:any, title:string) {
        HTMLWikipediaPageViewer.resetOverlays();

        // Dem ELement die Klasse "active" geben
        element.classList.toggle("active");

        var doc_width = window.innerWidth;
        var doc_height = window.innerHeight;

        var el_offset = this.getElementOffset(element);
        var el_pos = element.getBoundingClientRect();
        /*   Pfeilrichtung      Pfeilposition */
        var pos_screen_side_X, pos_screen_side_Y;
        
        if(el_pos.left < doc_width/2) {
            pos_screen_side_X = "left";
        } else {
            pos_screen_side_X = "right";
        }

        if(el_pos.top < doc_height/2) {
            pos_screen_side_Y = "top";
        } else {
            pos_screen_side_Y = "bottom";
        }

        var popup = document.createElement("div");
        popup.className = "popup";
        popup.setAttribute("data-arrow-pos", pos_screen_side_Y);
        popup.innerHTML = `<div class="arrow-${pos_screen_side_X}"></div><div onclick="HTMLWikipediaPageViewer.resetOverlays()" class="close-btn">X</div><div class="content"><div class="title">${title}</div><div class="entry">${entry.content}</div></div>`;

        popup.style.visibility = "hidden";

        parent.appendChild(popup);

        var rect = popup.getBoundingClientRect();

        var changeX = 0;
        var changeY = 0;
        if(pos_screen_side_X == "left") {
            changeX = element.getBoundingClientRect().width + 20;
        } else {
            changeX = -rect.width - 20;
        }
        if(pos_screen_side_Y == "top") {
            changeY = -element.getBoundingClientRect().height - 8;
        } else {
            changeY = -rect.height - 5;
        }

        // Position
        popup.style.left = Math.max(el_offset.left+changeX, 0)+"px";
        popup.style.top = Math.max(el_offset.top+changeY, 0)+"px";

        popup.style.visibility = "";
    }
    getElementOffset(element:HTMLElement) {
        const rect = element.getBoundingClientRect();
        return {
            left: rect.left + this.parent.scrollLeft,
            top: rect.top + this.parent.scrollTop
        }
    }
    static getHeadingFromIndent(identLevel:number=0):string {
        identLevel += 1;
        if(identLevel > 6)identLevel = 6;
        return "h"+identLevel;
    }
    write_sections(object:any, parent:HTMLElement|null=null, indentLevel:number=0) {
        if(!parent)parent = this;

        var div = document.createElement("div");
        div.className = "section";
        div.setAttribute("data-indent", String(indentLevel));
        div.style.setProperty("--indent", String(indentLevel));
        parent.appendChild(div);

        var h:string = HTMLWikipediaPageViewer.getHeadingFromIndent(indentLevel);
        div.innerHTML = `<${h} class="title">${HTMLWikipediaPageViewer.contentToWords(object.title)}</${h}><br><p class="section-content">${HTMLWikipediaPageViewer.contentToWords(object.content)}</p>`;
        div.addEventListener("click", this.word_onclick);
        if(object?.items) {
            for(var item of object.items) {
                this.write_sections(item, parent, indentLevel+1);
            }
        }
    }
    write_html(raw_html:string, parent:HTMLElement|null=null) {
        if(!parent)parent = this;
        var div = document.createElement("div");
        div.className = "raw-wiki wikipedia";
        div.innerHTML = HTMLWikipediaPageViewer.htmlToWords(raw_html);
        this.appendChild(div);
    }
    async load(title:string) {
        this.innerHTML = "";
        this.__title = title;
        var res:any = await this._wiki.page(this.__title);

        // Style: sections, no img etc
        var content = await res.content();
        for(var section of content) {
            this.write_sections(section);
        }
        
        /* Raw html */
        /*
        var html = await res.html();
        this.write_html(html);
        */
    }
}