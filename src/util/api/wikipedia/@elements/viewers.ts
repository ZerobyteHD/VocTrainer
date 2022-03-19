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
        url = url?.replace("//","https://");
    }
    return url;
}

export class HTMLWikipediaSearchViewer extends HTMLElement {
    _wiki:any;
    max_results:number;
    input:HTMLInputElement|null;
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
        this.input.placeholder = "Type here";
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

export class HTMLWikipediaPageViewer extends HTMLElement {
    _wiki:any;
    __title:string;
    parent:HTMLElement;
    word_onclick:(this: HTMLDivElement, ev: MouseEvent) => any;
    constructor(parent:HTMLElement) {
        super();
        this._wiki = wiki();
        this.__title = "";
        this.parent = parent;
        this.word_onclick = async(e:any)=>{
            if(e.target.className == "word") {

                var data:WiktionaryDataResult = await wiki_api.fetchData(e.target.innerText);
                window.data = data;
                if(data.error) {
                    this.createPopup(parent, e.target, {content:"Keine Definitionen gefunden"}, e.target.innerText);
                } else {
                    var html = "";

                    if(data.images) {
                        html += `<div class="dict-images">`;
                        for(var image of data.images) {
                            var img_url = await wiki_get_image("https://en.wiktionary.org"+image.url);
                            html += `<img src="${img_url}" alt="${image.caption}" title="${image.caption}">`;
                        }
                        html += "</div>";
                    }

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
                    this.createPopup(parent, e.target, {content: html}, e.target.innerText);
                }
            }
        }

        window.addEventListener("resize", ()=>{
            HTMLWikipediaPageViewer.resetOverlays();
        });
    }
    static contentToWords(content:string):string {
        var wordRegex = /([a-zA-Z\'\-]{1,})/g;
        return content.replace(wordRegex, "<span class='word'>$1</span>");
    }
    static resetOverlays() {
        var old = document.querySelector(".popup");
        if(old)old.remove();
        // @ts-ignore
        for(var active_word of document.querySelectorAll(".word.active")) {
            active_word.classList.toggle("active");
        }
    }
    createPopup(parent:HTMLElement, element:HTMLElement, entry:any, title:string) {
        HTMLWikipediaPageViewer.resetOverlays();

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
    write_sections(object:any, parent:any=null, indentLevel:number=0) {
        if(!parent)parent = this;

        var div = document.createElement("div");
        div.className = "section";
        div.setAttribute("data-indent", String(indentLevel));
        div.style.setProperty("--indent", String(indentLevel));
        parent.appendChild(div);

        div.innerHTML = `<span class="title">${HTMLWikipediaPageViewer.contentToWords(object.title)}</span><br><p class="section-content">${HTMLWikipediaPageViewer.contentToWords(object.content)}</p>`;
        div.addEventListener("click", this.word_onclick);
        if(object?.items) {
            for(var item of object.items) {
                this.write_sections(item, parent, indentLevel+1);
            }
        }
    }
    async load(title:string) {
        this.innerHTML = "";
        this.__title = title;
        var res:any = await this._wiki.page(this.__title);

        var content = await res.content();
        for(var section of content) {
            this.write_sections(section);
        }
    }
}