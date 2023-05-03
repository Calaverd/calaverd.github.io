/* This is to control the navigation redirection */
const window = globalThis.window;
const storage = window.localStorage;

let location = `${window.location}`.split('://')[1].split('/');
let requested_page = location.slice(1).join('/');

if(requested_page===undefined ||
    ( requested_page.length > 0  && requested_page !== '404.html') ){
    storage.setItem("not_found",`${requested_page}`);
    window.location.replace("/404.html");
}

