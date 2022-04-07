export interface VocabularyWordData {
    word: string;
    translation: string;
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

    constructor(data:VocabularyWordData[], callback:Function) {
        super(data, callback);
        this.pointer = 1;
        this.el_word = null;
        this.el_translation = null;
    }
    init() {
        this.innerHTML = `<div class="container vocab-container">
            <div class="top">
                <span>${this.data[0].word}</span>
            </div>
            <div class="bottom">
                <span>${this.data[0].translation}</span>
            </div>
        </div>`;
        this.el_word = this.children[0].children[0].children[0] as HTMLSpanElement;
        this.el_translation = this.children[0].children[1].children[0] as HTMLSpanElement;
    }
    next() {
        if(this.pointer >= this.data.length) {
            this.callback("end");
            return;
        }

        (this.el_word  as HTMLSpanElement).innerText = this.data[this.pointer].word;
        (this.el_translation  as HTMLSpanElement).innerText = this.data[this.pointer].translation;
        this.pointer++;
    }
}