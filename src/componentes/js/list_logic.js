import {Component, render } from "preact";
import {html} from 'htm/preact';

const localiced = {
    es:{title:"Lista de post." },
    en:{title:"Post list." },
};

const EstadoCarga = {
    Pendiente: 'Pendiente',
    Error: 'error',
    Ready: 'ready'
}


class Post extends Component {
    render() {
        const {post, lang} = this.props;
        const [page] = post.pages.filter( page => page.lang === lang );
        if (page) {
            const thumbnail_url = post.thumbnail;
            console.log(thumbnail_url.href);
            return html`
            <a href='${page.url}'>
              <img class='image is-128x128' src="${thumbnail_url.href}"/>
              <div>
                <p class="title">${ page.title ?? ''}</p>
                <p class='subtitle'>${ page.subtitle ?? '' }</p>
              </div>
            </a>`;
        }
        return '';
    }
}


class ListPost extends Component {
    constructor() {
        super();
        this.state = {
            jsonData: {},
            dataState: EstadoCarga.Pendiente,
            idiom: 'es'
        }
    }

    async componentDidMount() {
        globalThis.resetIdiom = ()=>{
            let doc = globalThis.document;
            const idiom = getUseIdiom();
            this.setState({ idiom });
            for( let [id,content] of Object.entries(localiced[idiom]) ){
                doc.getElementById(id).innerText = content;
            }
        }

        globalThis.resetIdiom();

        try{
            const {catalog} = await import('../../post/catalog.js');
            console.log(catalog);
            this.setState({dataState: EstadoCarga.Ready, jsonData: catalog});
        }catch {
            this.setState({dataState: EstadoCarga.Error});
        }
    }

    render() {
        const {idiom, jsonData, dataState} = this.state;
        if (dataState === EstadoCarga.Ready) {
            return html`
            <ul class='post-list'>
              ${jsonData.map( post => html`<li><${Post} post=${post} lang=${idiom}/></li>`)}
            </ul>`
        }
        return html`<p>Cargando...</p>`
    }
}

render(html`<${ListPost} />`, document.getElementById("desc"));