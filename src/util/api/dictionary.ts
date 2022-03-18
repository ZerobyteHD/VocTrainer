import fetch from "node-fetch";

export const API_URL = (lang:string, word:string):string => `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${word}`;

export async function getWordEntry(word:string):Promise<object> {
    var request:any = await fetch(API_URL("en", word));
    var json:object = await request.json();
    return json;
}