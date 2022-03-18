import { getWordEntry } from "./api/dictionary";

(async ()=>{
    var r = await getWordEntry("despair");
    console.log(r);
})();