
// storage is definend by idiom logic
let url = storage.getItem("not_found");

let localiced = {
    "es":{
        "page":"La página solicitada ",
        "not-found":`"${url}"`,
        "unaviable":"No esta disponible.",
        "go-mainpage":"Regresar a la página principal.",
    },
    "en":{
        "page":"The requested page ",
        "not-found":`"${url}"`,
        "unaviable":"Is not aviable.",
        "go-mainpage":"Return to main page.",
    }
}

globalThis.resetIdiom = ()=>{
    let doc = globalThis.document;
    let idiom = getUseIdiom();
    for( let to_replace of Object.entries(localiced[idiom]) ){
        doc.getElementById(to_replace[0]).innerText = to_replace[1];
    }
}

globalThis.resetIdiom();