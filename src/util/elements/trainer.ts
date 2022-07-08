/**
 * Diese Datei beinhaltet die Funktionen, die für das Vokabeltraining zuständig sind
 */

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
 * Super-Klasse
 */
export class HTMLTrainerElement extends HTMLElement {
    onsuccess:Function;
    onfail:Function;
    data:()=>Promise<any[]>; // Funktion für Daten
    el_next:HTMLAnchorElement|null;
    el_change:HTMLAnchorElement|null;
    el_descr:HTMLParagraphElement|null;
    mode_host:HTMLDivElement|null;
    next_cb:Function;

    constructor(_data:()=>Promise<any[]>, _onsuccess = (data:any)=>{}, _onfail = (data:any)=>{}) {
        super();
        this.onsuccess = _onsuccess;
        this.onfail = _onfail;
        this.data = _data;
        this.el_next = null;
        this.el_change = null;
        this.mode_host = null;
        this.el_descr = null;
        this.next_cb = ()=>{};
    }
    initAsHost() { // HTML-Elemente initialisieren
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

    /**
     * Modus wählen
     * @param mode Name des Modus
     */
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
            case "quiz":
                var __data = await this.data();
                shuffleArray(__data);
                var __elem = new HTMLTrainerModeVocabularyQuiz(__data, (e:string, data:any)=>{
                    if(e == "end") {
                        this.setMode("selector");
                        this.onsuccess(data);
                    } else if(e == "right-answer") {
                        this.onsuccess(data);
                    } else if(e == "wrong-answer") {
                        this.onfail(data);
                    }
                });
                __elem.init();
                this.next_cb = ()=>{__elem.next()};
                this.mode_host.appendChild(__elem);
                (this.el_descr as HTMLParagraphElement).innerText = "Finde das richtige Wort. Die anderen Wörter haben Rechtschreibfehler.";
                break;
            case "selector":
                var _elem = new HTMLTrainerElementSelect();
                _elem.init(["scanner", "quiz"], (item:string)=>{
                    this.setMode(item);
                }, this);
                this.mode_host.appendChild(_elem);
                this.next_cb = ()=>{};
                (this.el_descr as HTMLParagraphElement).innerText = "";

        }
    }
}

/**
 * Elemente zur Auswahl des Modus
 */
export class HTMLTrainerElementSelect extends HTMLElement {
    constructor() {
        super();
    }
    init(items:string[], callback:Function, context:ThisType<Object>) {
        this.innerHTML = `<h2>Wähle einen Modus aus</h2>`;
        for(let i in items) {
            var item = items[i];

            var el = document.createElement("a");
            el.dataset.item = item;
            el.addEventListener("click", (e)=>{
                callback.call(context, (e.target as HTMLAnchorElement).dataset.item);
            });
            el.innerText = item;
            el.className = "waves-effect waves-light btn";
            this.appendChild(el);
        }
    }
}

/**
 * Super-Klasse für Elemente der Trainermodi
 */
export class HTMLTrainerMode extends HTMLElement {
    data:VocabularyWordData[];
    callback:Function;

    constructor(_data:VocabularyWordData[], _callback:Function) {
        super();
        this.data = _data;
        this.callback = _callback;
    }
}

/**
 * Scanner-Modus
 */
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
    // nächstes Wort
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

export class HTMLTrainerModeVocabularyQuiz extends HTMLTrainerMode {
    pointer: number;
    el_hint: HTMLParagraphElement|null;
    el_options: HTMLDivElement|null;
    num_options: number;
    num_right: number;
    num_false: number;

    constructor(data:VocabularyWordData[], callback:Function) {
        super(data, callback);
        this.pointer = 0;
        this.el_hint = null;
        this.el_options = null;
        this.num_options = 3;
        this.num_right = 0;
        this.num_false = 0;
    }
    init() {
        this.innerHTML = `<div class="container vocab-container">
            <h4>Welches Wort kann durch die folgende Aussage/Eigenschaft beschrieben werden?</h4>
            <div class="top">
                <p id="hint"></p>
            </div>
            <div class="options">
            </div>
        </div>`;
        this.el_hint = this.querySelector("#hint");
        this.el_options = this.querySelector(".options");

        this.next();
    }
    next() {
        if(this.pointer >= this.data.length) {
            this.callback("end", {wrong: this.num_false, right: this.num_right, end:true});
            return;
        }

        (this.el_hint as HTMLParagraphElement).innerText = this.data[this.pointer].hint as string;
        (this.el_options as HTMLDivElement).innerHTML = "";

        var right_answer_added = false;

        for(var x = 1; x < this.num_options; x++) {
            // Zufallschance für Position der richtigen Antwort
            // 1. Runde: 1/2
            // 2. Runde: 1/1
            var add_answer = HTMLTrainerModeVocabularyQuiz.chance(1/this.num_options+1-x) && !right_answer_added;
            console.log(this.num_options-x, right_answer_added);
            if(add_answer) {
                right_answer_added = true;
                var btn = document.createElement("a");
                btn.className = "waves-effect waves-light btn";
                btn.innerText = this.data[this.pointer].word;
                btn.addEventListener("click", ()=>{
                    this.num_right += 1;
                    this.next();
                    this.callback("right-answer");
                });
                (this.el_options as HTMLDivElement).appendChild(btn);
            }

            var _btn = document.createElement("a");
            _btn.className = "waves-effect waves-light btn";
            var typo = HTMLTrainerModeVocabularyQuiz.generateTypo(this.data[this.pointer].word);
            _btn.innerText = typo == this.data[this.pointer].word ? typo+"m" : typo;
            _btn.addEventListener("click", ()=>{
                this.num_false += 1;
                this.callback("wrong-answer", this.data[this.pointer-1].word);
                this.next();
            });
            (this.el_options as HTMLDivElement).appendChild(_btn);
        }

        if(!right_answer_added) {
            var btn = document.createElement("a");
            btn.className = "waves-effect waves-light btn";
            btn.innerText = this.data[this.pointer].word;
            btn.addEventListener("click", ()=>{
                this.num_right += 1;
                this.next();
                this.callback("right-answer");
            });
            (this.el_options as HTMLDivElement).appendChild(btn);
        }

        this.pointer++;
    }
    static chance(ratio: number) {
        return ratio > Math.random();
    }
    // Generiert ein Wort mit Tippfehlern aus einer Wortvorlage
    static generateTypo(word: string) {
        var i_word = word;
        word = word.toLowerCase();
        if(word.includes("a")) {
            if(this.chance(0.4))word = word.replace("a", "e");
        }
        if(word.includes("o")) {
            if(this.chance(0.4))word = word.replace("o", "u");
        }
        if(word.includes("u")) {
            if(this.chance(0.3))word = word.replace("u", "ou");
        }
        if(word.includes("d")) {
            if(this.chance(0.4))word = word.replace("d", "t");
        }
        if(word.includes("i")) {
            if(this.chance(0.5))word = word.replace("i", "e");
        }
        if(word.includes("i")) {
            if(this.chance(0.3))word = word.replace("i", "y");
        }
        if(word.includes("y")) {
            if(this.chance(0.3))word = word.replace("y", "i");
        }
        if(word.includes("qu")) {
            if(this.chance(0.4))word = word.replace("qu", "q");
        }
        if(word.includes("r")) {
            if(this.chance(0.4))word = word.replace("r", "er");
        }

        // Doppelbuchstaben
        var reg_dbl_l = /((\w)\2)/;
        if(reg_dbl_l.test(word)) {
            if(this.chance(0.7))word = word.replace((reg_dbl_l.exec(word) as RegExpExecArray)[0], (reg_dbl_l.exec(word) as RegExpExecArray)[2]);
        } else {
            if(word.includes("p")) {
                if(this.chance(0.5))word = word.replace("p", "pp");
            }
        }

        if(word == i_word) {
            return word+"n";
        }

        if(i_word.startsWith("to")) {
            word = "to" + word.substring(2);
        }
        word = word.replace("tou", "to");

        return word;
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
