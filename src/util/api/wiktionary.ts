import fetch from "node-fetch";

declare global {
    interface Window {
        _data: any;
        search_wiki:Function;
    }
    interface Element {
        innerText: string;
    }
}

async function search_to_link(query:string) {
    function get_fitting_search(word:string, array:Array<string>) {
        for(var item of array) {
            if(item.endsWith(word))return item;
        }
        for(var item of array) {
            if(item.endsWith(word.toLowerCase()))return item;
        }
        return array[0];
    }
    var res = await fetch("https://en.wiktionary.org/w/api.php?action=opensearch&format=json&formatversion=2&search="+query+"&namespace=0&limit=3");
    var json = await res.json();
    if(json[3].length > 0) {
        return {success:true, link:get_fitting_search(query, json[3])};
    } else {
        return {success:false, link:"", error:"Suche ergab keine Treffer"};
    }
}

function element_get_filtered_text(element:Element) {
    var text = "";
    // @ts-ignore
    for(var child of element.childNodes) {
        if(["A","I","B","SPAN","P"].includes(child.tagName)) {
            text += child.innerText;
        } else if(child.nodeType == 3) {
            text += child.textContent;
        }
    }
    // @ts-ignore
    return text.replaceAll("\n", "");
}

function section_meaning_parser(tpye_name:string, currentData:any, element:Element) {
    var t = tpye_name.toLowerCase();
    // Bedeutung als Nomen
    if(element.querySelector(".headword")) {
        // Headword
        if(!currentData?.meanings) {
            currentData.meanings = {};
        }
        if(!currentData.meanings[t]) {
            currentData.meanings[t] = {head:element.innerText, meanings:[]};
        }
    } else if(element.tagName == "OL") {
        // @ts-ignore
        for(var li of element.children) {
            var text = element_get_filtered_text(li);
            var object:any = {};
            object.text = text;
            if(li.querySelector("dl")) {
                object.example = li.querySelector("dl").innerText;
            }
            currentData.meanings[t].meanings.push(object);
        }
    }
    return currentData;
}

function wiki_mw_element_parser(element:Element, currentData:any={}, sectionName="None"):any {
    if(currentData == undefined)currentData = {};
    if(element == null)return currentData;
    if(element.tagName == "H2" && element?.children[0]?.classList.contains(".mw-headline")) {
        console.log("Found new section, returning...");
        return currentData;
    }

    if(element.tagName != "H3") {
        if(sectionName == "Alternative_forms") {
            currentData.alternatives = {};
            currentData.alternatives.raw = element.innerText;
        } else if(sectionName == "Etymology") {
            if(!currentData.etymology)currentData.etymology = [];
            if(element.innerText != "\n")
            currentData.etymology.push(element.innerText);
        } else if(sectionName == "Pronunciation") {
            if(element.tagName == "UL") {
                if(!currentData?.pronunciation)currentData.pronunciation = [];

                var lis = element.children;
                // @ts-ignore
                for(var li of lis) {
                    // ist Reiminfo
                    if(li.innerText.startsWith("Rhymes")) {
                        currentData.rhymes = li.innerText;
                        continue;
                    }

                    // ist Audioteil
                    var object:any = {};
                    var ipa = li.querySelector(".IPA");
                    object.IPA = ipa ? ipa.innerText : "None";

                    var audio = li.querySelector(".audiometa > a");
                    object.audio = audio ? audio.getAttribute("href") : "None";

                    var type = li.querySelector(".unicode");
                    object.type = type ? type.innerText : "None";
                    currentData.pronunciation.push(object);
                }
            }
        } else if(["Proper_noun", "Noun", "Verb", "Adverb", "Adjective", "Conjunction", "Preposition", "Particle"].includes(sectionName)) {
            currentData = section_meaning_parser(sectionName, currentData, element);
        }
    }

    // Das nächste Element wurde nicht durch einen Titel angekündigt
    if(element.classList.contains("thumb")) {
        // Ist ein Bild
        console.log("Is image ", element);
        if(!currentData.images)currentData.images = [];
        var image = {
            url: element.querySelector("a.image")?.getAttribute("href"),
            caption: element.querySelector(".thumbcaption")?.innerText
        }
        currentData.images.push(image);
    } else if(element.tagName == "H3") {
        sectionName = element.children[0].id;
    }
    
    return wiki_mw_element_parser(element.nextElementSibling as Element, currentData, sectionName);
}

async function parse_wiki(wiki_url:string) {
    const parser = new DOMParser();
    var res = await fetch(wiki_url);
    var html = await res.text();
    var doc = parser.parseFromString(html, "text/html");

    var mw_english = doc.querySelector(".mw-headline#English")?.parentElement;
    var data = wiki_mw_element_parser(mw_english as Element, {url:wiki_url});
    return data;
}

export async function search_wiki(query:string) {
    var q:any = await search_to_link(query);
    if(q.success) {
        var data:any = await parse_wiki(q.link);
        return data;
    } else {
        return {error: "Could not find wiki"};
    }
}

window.search_wiki = search_wiki;