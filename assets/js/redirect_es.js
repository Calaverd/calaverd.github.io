// Si nos visitas usando un navegador en español, te llevamos al sitio en español.
if (typeof(Storage) !== "undefined"){
  if( !sessionStorage.set_lang ){
    sessionStorage.set_lang = true;
    // ¿la interfaz del navegador es en español?
    if( window.navigator.language.search('es') != -1 ){
      // console.log('El lenguaje del navegador es español'); 
      if( window.location.href.search(/\/es\//) == -1 ){
         // console.log("la pagina no esta en español, redirije a la versión en español");
         let spanish_page = window.location.href.replace(/(?<=\/\/.*)\//,'/es/')
         // ¿Exite la pagina en español?
         fetch(spanish_page).then(function(response) {
            console.log(response.status);
            if(response.status == 200){
               window.location.replace(spanish_page);
                }
            });
       }
    }
  }
}