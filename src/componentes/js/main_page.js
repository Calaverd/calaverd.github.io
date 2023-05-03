
globalThis.resetIdiom = ()=>{
    let doc = globalThis.document;
    let idiom = getUseIdiom();
    console.log("Idiom reset");
}

globalThis.resetIdiom();