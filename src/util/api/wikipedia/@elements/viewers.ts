import wiki from "wikijs";
import fetch from "node-fetch";
import WiktionaryScraper, { WiktionaryDataResult } from "js-wiktionary-scraper";
import Popup from "../../../elements/popups";

const wiki_api = new WiktionaryScraper();

declare global {
    interface Window {
        data:WiktionaryDataResult;
        UIPopup:typeof Popup
    }
}

window.UIPopup = Popup;

/**
 * Extrahiert den Source Link für ein Bild
 * @param src Bildquelle, z.B. https://commons.wikimedia.org/wiki/File:Stele_of_Vultures_detail_01a.jpg => https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Stele_of_Vultures_detail_01a.jpg/800px-Stele_of_Vultures_detail_01a.jpg?20171004232540
 * @returns 
 */
async function wiki_get_image(src:string) {
    const parser = new DOMParser();
    var res = await fetch(src);
    var html = await res.text();
    var doc = parser.parseFromString(html, "text/html");
    var url = doc.querySelector(".fullMedia .internal")?.getAttribute("href");
    if(!url?.startsWith("https")) {
        url = url?.replace("//","https://");
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
    /**
     * Element Setup, erzeugt z.B. die Suchleiste
     */
    async setup() {
        var div = document.createElement("div");
        div.className = "search-container";

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.id = "wiki-search";
        this.input.placeholder = "Auf Wikipedia.org suchen...";
        div.appendChild(this.input);

        this.preview = document.createElement("div");
        this.preview.className = "preview-container";
        div.appendChild(this.preview);

        this.input.addEventListener("input", async()=>{

            window.clearTimeout(this.intervall);
            this.intervall = window.setTimeout(async()=>{
                var query = this.input?.value;
                if(query == "") {
                    this.preview.innerHTML = "";
                    this.preview.dataset.active = false;
                    return;
                }

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
                this.preview.dataset.active = true;
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
                    var popup = new Popup(parent, e.target, e.target.innerText);
                    popup.setEntry({content:"Keine Definitionen gefunden"});
                } else {
                    // Wenn nicht:
                    var popup = new Popup(parent, e.target, e.target.innerText);

                    var html = "";
                    // Wenn es Bilder zu diesem Wort gibt, werden diese in das Popup eingebaut
                    if(data.images) {
                        html += `<div class="dict-images">`;
                        for(var image of data.images) {
                            var img_url = await wiki_get_image("https://en.wiktionary.org"+image.url);
                            html += `<img class="materialboxed" src="${img_url}" alt="${image.caption}" title="${image.caption}">`;
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
                    popup.setEntry({content: html});

                    // @ts-ignore
                    M.Materialbox.init(document.querySelectorAll(".materialboxed"));
                    /**
                     * Fehlt:
                     * Pronunciation, IPA
                     */
                }
            } else {
                Popup.resetAll();
            }
        }

        window.addEventListener("resize", ()=>{
            // Wenn die Größe des Fensters verändert wird, werden alle Overlays entfernt
            // Grund: Implementierung einer Anpassung zu aufwendig
            Popup.resetAll();
        });
    }
    /**
     * Konvertiert einen String zu einem String mit HTML Syntax aus SPAN-Elementen
     * @param content Zu konvertierender String
     * @returns HTML String mit Span-Elementen
     */
    static contentToWords(content:string):string {
        var wordRegex = /([a-zA-Z\'\-]{1,})/g; // Regulärer Ausdruck
        return content.replace(wordRegex, "<span class='word'>$1</span>");
    }
    /**
     * Umhüllt eine HTML-Text-Node mit einem Span-Element
     * @param textNode Die Text-Node
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
     */
    static recursiveHtmlToWords(element:HTMLElement):void {
        if(!element)return;
        if(element.childNodes) {
            for(var child_node of element.childNodes) {
                if(child_node.nodeType == 3) {
                    this.wrapTextNode(child_node);
                } else {
                    if((child_node as HTMLElement).tagName) {
                        this.recursiveHtmlToWords(child_node as HTMLElement);
                    }
                }
            }
        }
    }
    /**
     * Umhüllt jedes Wort aus dem rohen HTML String mit einem SPAN-Element
     * @param raw_html 
     * @returns 
     */
    static htmlToWords(raw_html:string):string {
        // "//" -> "https://"
        raw_html = raw_html.replace(/((?:srcset|src)=")(\/\/)/g, "$1https://");

        // Alle Wiki-links werden mit einen benutzerdefinierten Aufruf ausgetauscht
        // wiki-links -> window.wiki_page.load
        raw_html = raw_html.replace(/href="\/wiki\/([a-zA-Z_-]{1,})"/g, `href="javascript:window.wiki_page.load('$1')"`);

        var div = document.createElement("div");
        div.innerHTML = raw_html;
        this.recursiveHtmlToWords(div);
        return div.innerHTML;
    }
    /**
     * Gibt den Tag eines HTML-Heading-Elementes wieder
     * @param identLevel Einzug
     * @returns HTML-Heading-Element Tag
     */
    static getHeadingFromIndent(identLevel:number=0):string {
        identLevel += 1;
        if(identLevel > 6)identLevel = 6;
        return "h"+identLevel;
    }
    /**
     * Rekursive Funktion, um die Wikipedia Sektionen darzustellen
     * @param object Objekt der Sektion
     * @param parent Elternelement
     * @param indentLevel Einzug
     */
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
    /**
     * Gegenpol zu write_sections, schreibt direkt HTML zum Dokument
     * @param raw_html HTML-String
     * @param parent Elternelement
     */
    write_html(raw_html:string, parent:HTMLElement|null=null) {
        if(!parent)parent = this;
        var div = document.createElement("div");
        div.className = "raw-wiki wikipedia";
        div.innerHTML = HTMLWikipediaPageViewer.htmlToWords(raw_html);
        this.appendChild(div);
    }
    /**
     * Wikipediaseite laden
     * @param title Titel der Seite
     * @param load_type 1 | 2 Die Methode zur Darstellung der Wikiseite
     */
    async load(title:string, load_type=1) {
        this.innerHTML = "";
        this.__title = title;
        var res:any = await this._wiki.page(this.__title);

        // Alte Methode mit Sektionen, performancesparend
        if(load_type === 1) {
            var content = await res.content();
            for(var section of content) {
                this.write_sections(section);
            }
        } else if(load_type === 2) {
            // Neue Methode, unfassbar performancelastig
            var html = await res.html();
            this.write_html(html);
        } else throw "Unknown load type";
    }
}
