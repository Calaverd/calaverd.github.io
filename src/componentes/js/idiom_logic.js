/* Este archivo gestiona la logica necesaria para manejar la variedad de idiomas. */
const storage = window.localStorage;
// mandamos estas funciones al global para poder usarlas en todos los scripts.

/** Get the stored idiom 
 * returns a two character string with the idiom, or 
 * a null value if there is not a stored lang.
 */
globalThis.getUseIdiom = ()=>{
    let idiom = storage.getItem("idiom");
    if(typeof idiom !== "string"){
        // reisamos la preferencias de idioma del navegador.
        idiom = navigator.userLanguage || navigator.language;
        idiom = idiom.split("-")[0];
        // un visitante que no habla español ni ingles.
        if(idiom != 'es' && idiom != 'en') { idiom = 'en' }
        saveUseIdiom(idiom);
    }
    return idiom;
}


globalThis.saveUseIdiom = (idiom) => {
    console.log("saving idiom",idiom);
    storage.setItem("idiom",idiom);
}