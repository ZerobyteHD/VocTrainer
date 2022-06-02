import * as sqlite3 from "sqlite3";
import {join} from "path";
import * as fs from "fs";

const APPDATA = process.env.APPDATA as string;
const DB_LOC = join(APPDATA, "/phraser_trainer/vocab_data.db");
const DB_DIR = join(APPDATA, "/phraser_trainer/");

if(!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
}

export class VocabManager {
    db:sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database(DB_LOC, err => {
            if(err)console.error(err);
        });
        this.db.serialize(()=>{
            this.db.run("CREATE TABLE IF NOT EXISTS vocab (word TEXT, translation TEXT, type TEXT, hint TEXT)");
        });
    }
    async isDuplicate(word: string):Promise<boolean> {
        return new Promise((res, rej) => {
            this.db.serialize(()=>{
                this.db.get("SELECT * FROM vocab WHERE word = ?", [word], (err, row) => {
                    if(err)console.error(err);
                    if(row)res(true);
                    res(false);
                });
            });
        });
    }
    async getAll():Promise<any[]> {
        return new Promise((res, rej) => {
            this.db.serialize(()=>{
                this.db.all("SELECT * FROM vocab", (err, rows) => {
                    if(err) {
                        console.error(err);
                        res([]);
                    }
                    res(rows);
                });
            }); 
        });
    }
    async insert(word:string, translation:string|null, type:string|null, hint:string|null) {
        this.db.serialize(async ()=>{
            var is_dupl = await this.isDuplicate(word);
            if(!is_dupl) {
                this.db.run("INSERT INTO vocab (word, translation, type, hint) VALUES (?, ?, ?, ?)", [word, translation, type, hint], (err) => {
                    if(err)console.error(err);
                })
            }
        });
    }
    delete(word:string) {
        this.db.serialize(()=>{
            this.db.run("DELETE FROM vocab WHERE word = ?", [word], (err) => {
                if(err)console.error(err);
            })
        });
    }
    async getTableRepresentation() {
        var rows = await this.getAll();
        var trs = "";
        for(var row of rows) {
            trs += `<tr><td>${row.word}</td><td>${row.translation}</td><td>${row.type}</td><td>${row.hint}</td></tr>`;
        }
        return `<table class="highlight">
        <thead>
            <tr>
                <th>Wort</th>
                <th>Übersetzung</th>
                <th>Wortart</th>
                <th>Hinweis</th>
            <tr>
        </thead>
        <tbody>
            ${trs}
        </tbody>`;
    }
}