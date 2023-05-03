import {Component, render } from "preact";
import {html} from 'htm/preact';

let getUseIdiom = globalThis.getUseIdiom;
let saveUseIdiom = globalThis.saveUseIdiom;

class NavBar extends Component {
    constructor() {
        super();
        this.is_mounted = false;
        this.timer_to_close = null;
        this.state = {
            is_active: false,
            is_closing: false
        }
        this.icon_translate = new URL('../../rsc/icons/translate.svg', import.meta.url).toString(); 
        this.icon_blog = new URL('../../rsc/icons/blog.svg', import.meta.url).toString(); 
        this.icon_card = new URL('../../rsc/icons/card.svg', import.meta.url).toString();
        this.icon_msg = new URL('../../rsc/icons/message.svg', import.meta.url).toString();
        this.saved_lang = null;
        this.page_idiom = null;
        this.other_lang_url = null;
    }
    
    componentDidMount(){
        this.is_mounted = true;
        this.saved_lang = getUseIdiom();
        this.page_idiom = this.getPageDefaultIdiom();
        this.other_lang_url = this.getOtherLangURL();
        console.log(this.saved_lang);
        // keep the user languaje preferences and go to the selected page
        if( !!this.saved_lang && !!this.saved_lang
            && this.page_idiom != this.page_idiom ){
            this.goToOtherLang();
        }
    }

    componentWillUnmount(){
        this.is_mounted = false;
        if(this.timer_to_close){
            clearTimeout(this.timer_to_close);
        }
    }

    closeNavBar = ()=>{
        this.setState({ is_active:false, is_closing:false });
        clearTimeout(this.timer_to_close);
        this.timer_to_close = null
    }

    burgerAction = ()=>{
        console.log("burger was clicked");
        if( this.state.is_active && !this.state.is_closing ){
            // start closing
            this.setState({is_closing:true});
            // waith 500 miliseconds before closing it.
            // if you change this value, change it too in the main.css
            this.timer_to_close = setTimeout( this.closeNavBar, 500 );
            return;
        }
        this.setState( { is_active:true } );
    }

    getPageDefaultIdiom(){
        let lang_element = globalThis.document.getElementById("lang");
        if(!!lang_element){
            let lang = lang_element.getAttribute("value");
            if(typeof lang === "string" && lang.length > 0 ){
                return lang;
            }
        }
        return null;
    }

    getOtherLangURL = ()=>{
        let lang_elements = [ ...globalThis.document.getElementsByClassName("idiom")];
        for(let element of lang_elements){
            if( element.getAttribute("lang") != this.page_idiom ){
                return element.getAttribute("value");
            }
        }
        return null;
    }

    goToOtherLang = (event)=>{
        if(!!event){ 
            event.preventDefault();
        }
        // if is using spanish go to english version...
        // if is using english go to spanish version...
        let change_lang_to = "en;"
        if( !!this.saved_lang && !!this.page_idiom
            && this.page_idiom != this.saved_lang ){
            console.log("Cambio por no incidencia entre idioma pagina he idioma guardado");
            console.log(this.page_idiom);
            console.log(this.other_lang_url);
            change_lang_to = this.saved_lang;
        }else{
            console.log("Asumimos cambio por el usuario...");
            change_lang_to = this.saved_lang == "es" ? "en" : "es";
        }
        
        // update the saved idiom...
        saveUseIdiom(change_lang_to);

        //Do the change.
        
        if(!!this.other_lang_url){
            globalThis.window.location.replace(this.other_lang_url);
        }
        // if you are here, then there is not a post for this one.
        // reload the page with the new lang set.
        // we asume the script related to this page has a resetIdiom
        else if(!!globalThis.resetIdiom){
            this.closeNavBar();
            globalThis.resetIdiom();
        }else{
            // reload the whole page!
            globalThis.location.reload();
        }
    }

    render() {
        this.saved_lang = getUseIdiom();

        let active_class = this.state.is_active ? "is-active" : "";
        let closing_class = this.state.is_closing ? "is-closing" : "";
        
        // the burger animation starts only if not "is-active"
        // this is to trigger it when is starting to close.
        let burger_class = this.state.is_closing ? "" : active_class;

        // only fade in if it is not mounted
        let class_fadein = !this.is_mounted ? 'is-fadein' : '';

        
        let lang_text = this.saved_lang == "es" ? 'En' :  'Es'; 
        let contact_text = this.saved_lang == 'es' ? 'Contacto' : 'Contact';
        let about_text =  this.saved_lang == 'es' ? 'Acerca de mi' : 'About me';
        let blog_text =  "Blog";

        return html`
        <div class="navbar-brand ${class_fadein}">
          <a class="navbar-item" href="/">
            <strong class="pl-2">Calaverd</strong> 
          </a>
          <a role="button" class="navbar-burger ${burger_class} ${class_fadein}"
             aria-label="menu" aria-expanded="false" tabindex="0"
             onClick="${ this.burgerAction }"
             target-data="navbarBasicExample" >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div class="navbar-menu ${active_class} ${closing_class}">
            <div class="navbar-end ${class_fadein}">
                <a class="navbar-item">
                <span class="icon pr-1">
                    <img src="${this.icon_msg}" aria-hidden="true"/>
                </span><strong>${contact_text}</strong>
                </a>
                <a class="navbar-item">
                <span class="icon pr-1">
                    <img src="${this.icon_card}" aria-hidden="true"/>
                </span><strong>${about_text}</strong>
                </a>
                <a class="navbar-item" href="/post/list.html">
                    <span class="icon pr-1">
                        <img src="${this.icon_blog}" aria-hidden="true"/>
                    </span><strong>${blog_text}</strong>
                </a>
                <a class="navbar-item pr-1 has-background-info has-text-white px-2 nav-lang" 
                    href=${ !!this.other_lang_url ? this.other_lang_url : '#' }
                    onClick=${this.goToOtherLang} >
                    <span class="icon">
                        <img src="${this.icon_translate}" aria-hidden="true"/>
                    </span><strong>${lang_text}</strong>
                </a>
            </div>
        </div>`
    }
}


render(html`<${NavBar} />`, document.getElementById("navigation"));