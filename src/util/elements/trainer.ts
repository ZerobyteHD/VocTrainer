export interface VocabularyWordData {
    word: string;
    translation: string;
    type: string | null;
    hint: string | null;
}

export function shuffleArray(array: any[]) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * @HTML vocab-trainer
 */
export class HTMLTrainerElement extends HTMLElement {
    onsuccess:Function;
    data:()=>Promise<any[]>;
    el_next:HTMLAnchorElement|null;
    el_change:HTMLAnchorElement|null;
    el_descr:HTMLParagraphElement|null;
    mode_host:HTMLDivElement|null;
    next_cb:Function;

    constructor(_data:()=>Promise<any[]>, _onsuccess = ()=>{}) {
        super();
        this.onsuccess = _onsuccess;
        this.data = _data;
        this.el_next = null;
        this.el_change = null;
        this.mode_host = null;
        this.el_descr = null;
        this.next_cb = ()=>{};
    }
    initAsHost() {
        this.innerHTML = `<div class="col s12">
            <p class="description">
            </p>
            <div class="mode-window">
            </div>
            <div class="btn-array">
                <a id="next" class="waves-effect waves-light btn"><i class="material-icons left">arrow_forward</i>Weiter</a>
                <a id="change-mode" class="waves-effect waves-light btn"><i class="material-icons left">settings</i>Modus ändern</a>
            </div>
        </div>`;
        this.mode_host = this.querySelector(".mode-window");
        this.el_next = this.querySelector("#next") as HTMLAnchorElement;
        this.el_change = this.querySelector("#change-mode") as HTMLAnchorElement;
        this.el_descr = this.querySelector(".description") as HTMLParagraphElement;

        this.el_next.addEventListener("click", ()=>{this.next_cb()});
        this.el_change.addEventListener("click", ()=>{
            this.setMode("selector");
        });

        this.setMode("selector");
    }
    async setMode(mode:string) {
        console.info("Set mode called with param", mode);
        this.mode_host = this.mode_host as HTMLDivElement;
        this.mode_host.innerHTML = "";
        switch(mode) {
            case "scanner":
                var __data = await this.data();
                shuffleArray(__data);
                var elem = new HTMLTrainerModeVocabularyScanner(__data, (e:string)=>{
                    if(e == "end") {
                        this.setMode("selector");
                        this.onsuccess();
                    }
                });
                elem.init();
                this.next_cb = ()=>{elem.next()};
                this.mode_host.appendChild(elem);
                (this.el_descr as HTMLParagraphElement).innerText = "Lies dir die Einträge durch und präge sie dir ein";
                break;
            case "selector":
                var _elem = new HTMLTrainerElementSelect();
                _elem.init(["scanner"], (item:string)=>{
                    this.setMode(item);
                }, this);
                this.mode_host.appendChild(_elem);
                this.next_cb = ()=>{};
                (this.el_descr as HTMLParagraphElement).innerText = "";

        }
    }
}

export class HTMLTrainerElementSelect extends HTMLElement {
    constructor() {
        super();
    }
    init(items:string[], callback:Function, context:ThisType<Object>) {
        this.innerHTML = `<h2>Wähle einen Modus aus</h2>`;
        for(let i in items) {
            var item = items[i];
            var cb = ()=>{callback.call(context, item)};

            var el = document.createElement("a");
            el.addEventListener("click", cb);
            el.innerText = item;
            el.className = "waves-effect waves-light btn";
            this.appendChild(el);
        }
    }
}

export class HTMLTrainerMode extends HTMLElement {
    data:VocabularyWordData[];
    callback:Function;

    constructor(_data:VocabularyWordData[], _callback:Function) {
        super();
        this.data = _data;
        this.callback = _callback;
    }
}

export class HTMLTrainerModeVocabularyScanner extends HTMLTrainerMode {
    pointer: number;
    el_word: HTMLSpanElement|null;
    el_translation: HTMLSpanElement|null;
    el_word_info: HTMLSpanElement|null;
    el_example: HTMLParagraphElement|null;

    constructor(data:VocabularyWordData[], callback:Function) {
        super(data, callback);
        this.pointer = 1;
        this.el_word = null;
        this.el_translation = null;
        this.el_word_info = null;
        this.el_example = null;
    }
    init() {
        this.innerHTML = `<div class="container vocab-container">
            <div class="top">
                <span>${this.data[0].word}</span>
                <span class="word-info">${(this.data[0].type as string).replace("_"," ")}</span>
            </div>
            <div class="bottom">
                <span>${this.data[0].translation ? "Übersetzung: "+this.data[0].translation : ""}</span>
            </div>
            <div class="example">
                <p>${this.data[0].hint ? this.data[0].hint : ""}</p>
            </div>
        </div>`;
        this.el_word = this.children[0].children[0].children[0] as HTMLSpanElement;
        this.el_translation = this.children[0].children[1].children[0] as HTMLSpanElement;
        this.el_word_info = this.children[0].children[0].children[1] as HTMLSpanElement;
        this.el_example = this.children[0].children[2].children[0] as HTMLParagraphElement;
    }
    next() {
        if(this.pointer >= this.data.length) {
            this.callback("end");
            return;
        }

        (this.el_word  as HTMLSpanElement).innerText = this.data[this.pointer].word;
        (this.el_translation  as HTMLSpanElement).innerText = this.data[this.pointer].translation ? "Übersetzung: "+this.data[this.pointer].translation : "";
        (this.el_word_info as HTMLSpanElement).innerText = (this.data[this.pointer].type as string).replace("_"," ");
        (this.el_example as HTMLParagraphElement).innerText = this.data[this.pointer].hint ? (this.data[this.pointer].hint as string) : "";
        this.pointer++;
    }
}

export class HTMLTrainerModeInputWord extends HTMLTrainerMode {
    input: HTMLInputElement|null;
    pointer:number;
    el_translation: HTMLSpanElement|null;
    el_word_info: HTMLSpanElement|null;

    constructor(data:VocabularyWordData[], callback:Function) {
        super(data, callback);
        this.input = null;
        this.pointer = 1;
        this.el_translation = null;
        this.el_word_info = null;
    }
    init() {
        this.innerHTML = `<div class="container vocab-container">
            <div class="top">
                <h2>Übersetze </h2><span>${this.data[0].translation} <span class="word-info">${(this.data[0].type as string).replace("_"," ")}</span><span> ins Englische</span></span>
            </div>
            <div class="bottom">
                <input id="direct" type="text">
                <span>Abgeben</span>
            </div>
        </div>`;
        this.input = this.children[0].children[1].children[0] as HTMLInputElement;
        this.el_translation = this.children[0].children[0].children[1] as HTMLSpanElement;
        this.el_word_info = this.el_translation.children[0] as HTMLSpanElement;

        var btn_continue = this.children[0].children[1].children[1];
        btn_continue.addEventListener("click", ()=>{
            var isRight = this.input?.value.toLowerCase() == this.data[this.pointer].word.toLowerCase();
            if(isRight)this.callback("right-answer");
            this.next();
        });
    }
    next() {
        if(this.pointer >= this.data.length) {
            this.callback("end");
            return;
        }

        (this.el_translation  as HTMLSpanElement).innerText = this.data[this.pointer].translation;
        (this.el_word_info as HTMLSpanElement).innerText = (this.data[this.pointer].type as string).replace("_"," ");
        this.pointer++;
    }
}
