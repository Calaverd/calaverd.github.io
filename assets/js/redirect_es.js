// Si nos visitas usando un navegador en español, te llevamos al sitio en español.
if (typeof(Storage) !== "undefined"){
  if( sessionStorage.set_lang ){
    return;
  }
  sessionStorage.set_lang = true;
  // si el lenguaje del navegador no es español o la ventana ya esta en la version española
  if( !window.navigator.language.includes('es') || window.location.href.includes("/es/") ){
    return;
  }
  let spanish_page = window.location.href.replace(/(?<=\/\/.*)\//,'/es/');
  fetch(spanish_page, {method: 'HEAD'}).then(response => {
    if (response.status == 200) {
        window.location.replace(spanish_page);
      }
  });
}