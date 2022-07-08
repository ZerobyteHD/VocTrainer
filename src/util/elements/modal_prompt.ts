/**
 * Beschreibt eine Funktion zur Aufforderung von Benutzerinput
 * @param material_element Host-Element
 * @param title Titel des Popup
 * @param inputs Inputplatzhalter
 * @param values IDs der Inputs
 * @returns Promise<Object>
 */
export async function show_prompt(material_element: any, title:string, inputs: string[], values: string[]) {
    var element = material_element.el;
    var content = element.querySelector(".modal-content");
    var footer = element.querySelector(".modal-footer");
    content.innerHTML = `<h4>${title}</h4>`;
    var c = 0;
    for(var input of inputs) {
        content.innerHTML += `<div class="input-field col s12">
        <input placeholder="${input}" id="inp${c}" type="text" class="validate">
      </div>`;
        c++;
    }

    footer.innerHTML = "";
    var anchor = document.createElement("a");
    anchor.className = "waves-effect waves-green btn-flat";
    anchor.innerText = "OK";
    footer.appendChild(anchor);
    
    var cancel_anchor = document.createElement("a");
    cancel_anchor.className = "waves-effect waves-green btn-flat";
    cancel_anchor.innerText = "Abbrechen";
    footer.appendChild(cancel_anchor);
    material_element.open();

    return new Promise((res, rej)=>{
        anchor.addEventListener("click", ()=>{
            var obj = {};
            for(var i in inputs) {
                obj[values[i]] = (document.querySelector("#inp"+i) as HTMLInputElement).value;
            }
            material_element.close();
            res(obj);
        });
        cancel_anchor.addEventListener("click", ()=>{
            material_element.close();
            res({canceled: true});
        });
    });
}