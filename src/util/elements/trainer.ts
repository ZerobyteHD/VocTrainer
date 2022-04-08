export interface VocabularyWordData {
    word: string;
    translation: string;
    type: string;
    hint: string;
}

export class HTMLTrainerElement extends HTMLElement {
    onsuccess:Function;
    data:VocabularyWordData[];

    constructor(_data:VocabularyWordData[], _onsuccess = ()=>{}) {
        super();
        this.onsuccess = _onsuccess;
        this.data = _data;
    }
    setMode(mode:string) {
        this.innerHTML = "";
        switch(mode) {
            case "scanner":
                var elem = new HTMLTrainerModeVocabularyScanner(this.data, (e:string)=>{console.log(e)});
                elem.init();
                this.appendChild(elem);
                break;
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

    constructor(data:VocabularyWordData[], callback:Function) {
        super(data, callback);
        this.pointer = 1;
        this.el_word = null;
        this.el_translation = null;
        this.el_word_info = null;
    }
    init() {
        this.innerHTML = `<div class="container vocab-container">
            <div class="top">
                <span>${this.data[0].word} <span class="word-info">${this.data[0].type.replace("_"," ")}</span></span>
            </div>
            <div class="bottom">
                <span>${this.data[0].translation}</span>
            </div>
        </div>`;
        this.el_word = this.children[0].children[0].children[0] as HTMLSpanElement;
        this.el_translation = this.children[0].children[1].children[0] as HTMLSpanElement;
        this.el_word_info = this.el_word.children[0];
    }
    next() {
        if(this.pointer >= this.data.length) {
            this.callback("end");
            return;
        }

        (this.el_word  as HTMLSpanElement).innerText = this.data[this.pointer].word;
        (this.el_translation  as HTMLSpanElement).innerText = this.data[this.pointer].translation;
        (this.el_word_info as HTMLSpanElement).innerText = this.data[this.pointer].type.replace("_"," ");
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
                <h2>Übersetze </h2><span>${this.data[0].translation} <span class="word-info">${this.data[0].type.replace("_"," ")}</span><span> ins Englische</span></span>
            </div>
            <div class="bottom">
                <input id="direct" type="text">
                <span>Abgeben</span>
            </div>
        </div>`;
        this.input = this.children[0].children[1].children[0];
        this.el_translation = this.children[0].children[0].children[1];
        this.el_word_info = this.el_translation.children[0];

        var btn_continue = this.children[0].children[1].children[1];
        btn_continue.addEventListener("click", ()=>{
            var isRight = this.input.value.toLowerCase() == this.data[this.pointer].word.toLowerCase();
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
        (this.el_word_info as HTMLSpanElement).innerText = this.data[this.pointer].type.replace("_"," ");
        this.pointer++;
    }
}