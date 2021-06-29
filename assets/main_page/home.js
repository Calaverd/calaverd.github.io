// SVG animations
let helix1 = document.getElementById('helix1');
let helix2 = document.getElementById('helix2');
let frames = [helix1, helix2];
let frame = 0;
helix2.style.visibility = "hidden"

let ctr_monitor = document.getElementById('ctr-monitor');
let crt_text = [...ctr_monitor.getElementsByTagName("g")[1].getElementsByTagName("rect")];
let current_ctr_text = 0;
crt_text.forEach( x => { x.style.visibility = "hidden"; });
crt_text.sort((a, b) => (a.getAttribute("y") > b.getAttribute("y")) ? 1 : -1);

// NMS decode effects
const rand_char_list = [...'↗↘↙↚↛↜↝↞↟↠↡↢↣↤↥↦↧↨↩↪↫↬↭↮↯↰↱↲↳↴↵↶↷↸↹↺↻↼↽↾↿⇀⇁⇂⇃⇄⇅⇆⇇⇈⇉⇊⇋⇌⇍⇎⇏⇐⇑⇒⇓⇔⇕⇖⇗⇘⇙⇚⇛⇜⇝⇞⇟⇠⇡⇢⇣⇤⇥┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋═║╒╓╔╕╖▀▁▂▃▄▅▆▇█▉░▒▓▖▗▘▙▚▛▜▝▞▟■□▢▣▤▥▦▧▨▩▲△▶▷▼▽◀◁◆◈◉○◌◍◐◑◒◓◔◕◖'];


const active_css = "has-text-primary";
const inactive_css = "has-text-link"; 
const decipher_css = "has-text-danger";

let decipher_simbol_list = [...'⬟⬣⯂⬢⬟⬣⯂⬢'];
const control_active_simbol = ' ⯀ ';
const control_inactive_simbol = ' ⬦ ';
const control_transition_simbol = ' ⯍ ';
decipher_simbol_list.forEach( function(x,i){ this[i]=' '+x+' '; console.log(this[i]); }, decipher_simbol_list ) ;

//
let info_about = document.getElementById('info-about');
let info_contact = document.getElementById('info-contact');
//let portafolio = document.getElementById('portafolio');

let title_node = info_about.childNodes[1];
let text_list = [];
text_list[info_about.id] = [...info_about.getElementsByTagName('p')];
text_list[info_contact.id] = [...info_contact.getElementsByTagName('a')];
//text_list[portafolio.id] = [...portafolio.getElementsByTagName('p')];

let text_list_sectets = [];
text_list_sectets[info_about.id] = [];
text_list_sectets[info_contact.id] = [];
//text_list_sectets[portafolio.id] = [];

for(let i=0; i<text_list[info_about.id].length; i++){
    text_list_sectets[info_about.id].push(getOfuscated(text_list[info_about.id][i].innerHTML));
    text_list[info_about.id][i].innerHTML = text_list_sectets[info_about.id][i]["ofuscated"];
}

for(let i=0; i<text_list[info_contact.id].length; i++){
    text_list_sectets[info_contact.id].push(getOfuscated(text_list[info_contact.id][i].innerHTML));
    text_list[info_contact.id][i].innerHTML = text_list_sectets[info_contact.id][i]["ofuscated"];
}

let list_portafolio_id_nodes = ['p-python', 'p-javascript', 'p-hmlt-css', 'p-lua'];
let list_portafolio_nodes = [];
list_portafolio_id_nodes.forEach( x =>{
    let portafolio = document.getElementById(x);
    text_list[portafolio.id] = [...portafolio.getElementsByTagName('p')];
    text_list_sectets[portafolio.id] = [];
    for(let i=0; i<text_list[portafolio.id].length; i++){
        text_list_sectets[portafolio.id].push(getOfuscated(text_list[portafolio.id][i].innerHTML));
        text_list[portafolio.id][i].innerHTML = text_list_sectets[portafolio.id][i]["ofuscated"];
    }
    list_portafolio_nodes.push(portafolio);
});



function getRandom(min, max){ return Math.floor(Math.random()*(max-min+1)+min); };


function randChart(){ 
    return rand_char_list[getRandom(0,rand_char_list.length-1)];
};

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    };
};

function getOfuscated(base_string){
    let i = 0;
    chart_list = [];
    let word = '' ;
    while(i< base_string.length){
        let base_num_runs = 2;
        if(i%2 == 1){base_num_runs = getRandom(8, 13)};
        chart_list[i] = {
            basec: base_string.charAt(i),
            runs: base_num_runs+getRandom(0,5),
            nchar: randChart()
        };
        if(chart_list[i].basec == ' '){
          chart_list[i].nchar = ' '+chart_list[i].nchar;
          chart_list[i].runs = 0;
        };
        word += chart_list[i].nchar;
        i++;
    };
    let new_str = ''
    chart_list.forEach( x =>(new_str+=x.nchar));
    chart_list['ofuscated'] = "<span class='has-text-primary'>"+word+"</span>";
    chart_list['all_zeros'] = false;
    return chart_list;
};

function decipherRun(parent, current_text, solved_color){
    removeAllChildNodes(parent);
    
    let all_zeros = true;
    let i = 0;
    if(!current_text['all_zeros']){
        while(i < current_text.length){
            current_text[i].runs--;
            current_text[i].nchar = String.fromCharCode(current_text[i].nchar.charCodeAt()+2-getRandom(0,1));
            if( current_text[i].runs <= 0 ){
                all_zeros = all_zeros && true;
                let tag = document.createElement("span");
                let text = document.createTextNode(current_text[i].basec);
                tag.classList.add("has-text-primary");
                tag.appendChild(text);
                parent.appendChild(tag);
                }
            else{
                all_zeros = all_zeros && false;
                let tag = document.createElement("span");
                let text = document.createTextNode(current_text[i].nchar);
                tag.classList.add(solved_color);
                tag.appendChild(text);
                parent.appendChild(tag);
                };
            i++;
        };
    }
    if(all_zeros){
        current_text['all_zeros'] = true;
    }
    return all_zeros;
}
        
class ControlPoint{
    constructor(container, on_click) { //function(){ setNewWord(i) }
        this.tag = document.createElement("a");
        this.tag.classList.add(inactive_css);
        this.tag.appendChild(document.createTextNode( control_inactive_simbol ));
        this.tag.addEventListener("click", on_click);  
        container.appendChild(this.tag);
    }
    setText(text){ this.tag.innerHTML = text; }
    setInactive(text){
        this.tag.innerHTML = control_inactive_simbol;
        this.tag.classList.remove(decipher_css);
        this.tag.classList.remove(active_css);
        this.tag.classList.add(inactive_css);
    }
    setActive(){
        this.tag.innerHTML = control_active_simbol;
        this.tag.classList.remove(decipher_css);
        this.tag.classList.remove(inactive_css);
        this.tag.classList.add(active_css);
    }
    setDecipher(){
        this.tag.innerHTML = decipher_simbol_list[0];
        this.tag.classList.remove(active_css);
        this.tag.classList.remove(inactive_css);
        this.tag.classList.add(decipher_css);
    }
    setTransition(){
       this.tag.innerHTML = control_transition_simbol;
    }
}

// this is just to handle the text bellow the name.
// This was way simple than rewrite it as a class
let main_text = new function(){

    const underscore_a = '▯';
    const underscore_b = '▮';

    let my_text = undefined;
    let html_element = undefined;
    let skill_list = [];
    let control_list = [];

    let current_word = 0;
    let current_position = 0;
    let esperar_por_n_ticks = 0;

    let state = 0; // write text
    const st_write    = 0;
    const st_decipher = 1;
    const st_espera   = 2;
    const st_delete   = 3;
    const st_get_next = 4;

    let setNewWord = function(num){
        // set the new used
        control_list[current_word].setInactive();
        current_word = num;
        my_text = getOfuscated(skill_list[current_word]);
        state = st_write;
        control_list[current_word].setActive();
    }

    let getNextWord = function(){
        control_list[current_word].setInactive();
        if( current_word+1 >= skill_list.length){
            current_word = 0;
        }else{
            current_word++;
        };
        my_text = getOfuscated(skill_list[current_word]);
        state = st_write;
        control_list[current_word].setActive();
    }

    let writeText = function(current_text){
        if(current_position < current_text.length){
            let i = 0
            removeAllChildNodes(html_element);
            while(i <= current_position){
                let tag = document.createElement("span");
                let text = document.createTextNode(current_text[i].nchar);
                tag.classList.add("has-text-primary");
                tag.appendChild(text);
                html_element.appendChild(tag);
                i++;
            };
            current_position++;
            if(current_position != current_text.length){
                let tag = document.createElement("span");
                let text = document.createTextNode(underscore_b);
                tag.classList.add("has-text-link");
                tag.appendChild(text);
                html_element.appendChild(tag);
            };
        }else{
            state = st_decipher;
            current_position = 0;
            esperar_por_n_ticks = 0;
            
            control_list[current_word].setDecipher();
        };
    };
    
    let current_tick = 0;
    let decipherText = function(current_text){
        esperar_por_n_ticks++;
        
        let tick = esperar_por_n_ticks % decipher_simbol_list.length;
        if( current_tick != tick ){
            current_tick = tick; 
            control_list[current_word].setText(decipher_simbol_list[tick]);
            }
        // move to the next face only if there is no more ofuscated chars
        if( decipherRun( html_element, current_text, "has-text-danger") ){
            control_list[current_word].setActive();
            state = st_espera;
            esperar_por_n_ticks = 20;
            current_tick = 0
        };
    };

    let esperaText = function(current_text){
        html_element.innerHTML=''
        current_text.forEach(x =>{
            html_element.innerHTML += x.basec;
        })
        if(esperar_por_n_ticks > 0){
            esperar_por_n_ticks--;
        }else{
           state = st_delete; // st delete or st decipher
           current_position = current_text.length-1;
        };
    };

    let deleteText = function(current_text){
        if(current_position >= 0){
            let i = 0;
            removeAllChildNodes(html_element);
            while(i < current_position-1){
                html_element.innerHTML += current_text[i].basec;
                i++;
            };
            current_position--;
            let tag = document.createElement("span");
            let text = document.createTextNode(underscore_b);
            tag.classList.add("has-text-danger");
            tag.appendChild(text);
            html_element.appendChild(tag);
        }
        else{
            control_list[current_word].setTransition();
            html_element.innerHTML=''
            html_element.innerHTML += underscore_a;
            state = st_get_next;
        }
    };

    this.updateText = function(){
        switch(state){
            case st_write:
                writeText(my_text);
                break;
            case st_decipher:
                decipherText(my_text);
                break;
            case st_espera:
                esperaText(my_text);
                break;
            case st_delete:
                deleteText(my_text);
                break;
            case st_get_next:
                getNextWord();
        };
    };

    this.initControls = function(){
        let controls_container = document.getElementById('t-controls');
        for(let i=0;i<skill_list.length;i++){
            control_list.push( new ControlPoint(controls_container, function(){ setNewWord(i) }));  
        }
        control_list[current_word].setActive();
    }
    
    this.startText = function(){
        //has-text-dark
        html_element = document.getElementById('skills');
        
        let skill_lang = html_element.innerHTML;
        if(skill_lang == 'es'){
            skill_list[0] = "Programador";
            skill_list[1] = "Desarrollador De Juegos";
            skill_list[2] = "Desarrollador Web";
        }else{
            skill_list[0] = "Programmer";
            skill_list[1] = "Game Developer";
            skill_list[2] = "Web Developer";
        };
        
        html_element.innerHTML='';
        my_text = getOfuscated(skill_list[0]);
    };
}

function runFrameAnimations(){
    frames[frame].style.visibility = "hidden";
    frame = (frame+1)%2;
    frames[frame].style.visibility = "visible";
    
    // crt animation text
    if(current_ctr_text < crt_text.length){
        crt_text[current_ctr_text].style.visibility = "visible";
        current_ctr_text +=1;
    }else{
        current_ctr_text = 0;
        crt_text.forEach( x => { x.style.visibility = "hidden"; });
    }
}

const ob_options = {
  rootMargin: '10px 0px',
  threshold: 0.75
}

let observer = new IntersectionObserver(function(entradas, observador){
entradas.forEach( x => {
if(x.isIntersecting){
    observador.unobserve(x.target);
    let bade_id = x.target.id;
    var intervalId = window.setInterval(function(){
       let clear = 0;
       for(let i=0; i < text_list[bade_id].length; i++){
           if( decipherRun( text_list[bade_id][i], text_list_sectets[bade_id][i], "has-text-danger") ){
                clear++; 
                text_list[bade_id][i].innerHTML = '';
                text_list_sectets[bade_id][i].forEach(x =>{
                    text_list[bade_id][i].innerHTML += x.basec;
                })
           }
       if(clear == text_list[bade_id].length){
           clearInterval(intervalId);
           }
       }
    }, 45);
       
    }
});
}, ob_options);

observer.observe( info_about );
observer.observe( info_contact );
list_portafolio_nodes.forEach( node =>{
    observer.observe( node );
} );


main_text.startText();
main_text.initControls();

window.setInterval( function(){ main_text.updateText(); runFrameAnimations(); },80);
