const underscore_a = '▯';
const underscore_b = '▮';

let my_text = undefined;
let skill_list = [];
let current_word = 0;
let current_position = 0;
let esperar_por_n_ticks = 0;

let state = 0; // write text
const st_write    = 0;
const st_decipher = 1;
const st_espera   = 2;
const st_delete   = 3;
const st_get_next = 4;

function getRandom(min, max){ return Math.floor(Math.random()*(max-min+1)+min); };

function randChart(){ 
    let grup = getRandom(0,8);
    let upper_limit = 25;
    if(grup == 0 ){ //letter like simbos have the lowest probability, you do not what to form a random word
        grup = getRandom(0,2);
        if(grup == 0){
            return String.fromCharCode(getRandom(20,128-upper_limit));
        }else{
            return String.fromCharCode(getRandom(160,260-upper_limit));
        };
    }else if( grup <= 3 ){
        return String.fromCharCode(getRandom(8592,8703-upper_limit));
    }else if(grup < 6){
        return String.fromCharCode(getRandom(9472,9584-upper_limit));
    }else{
        return String.fromCharCode(getRandom(9600,9631-upper_limit));
    }
   // return 'a'
};

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    };
};

function getOfuscated(base_string){
    let i = 0;
    chart_list = [];
    while(i< base_string.length){
        let base_num_runs = 2;
        if(i%2 == 1){base_num_runs = getRandom(10, 15)};
        chart_list[i] = {
            basec: base_string.charAt(i),
            runs: base_num_runs+getRandom(5, 10),
            nchar: randChart()
        };
        i++;
    };

    let new_str = ''
    chart_list.forEach( x =>(new_str+=x.nchar));
    return chart_list;
};


function startText(){
    //has-text-dark
    let skill_lang = document.getElementById('skills').innerHTML;
    if(skill_lang == 'es'){
        skill_list[0] = "Programador";
        skill_list[1] = "Desarrollador De Juegos";
        //skill_list[2] = "Mal Pixel Artist";
        skill_list[2] = "Desarrollador Web";
    }else{
        skill_list[0] = "Programmer";
        skill_list[1] = "Game Developer";
        //skill_list[2] = "Bad Pixel Artist";
        skill_list[2] = "Web Developer";
    };
    document.getElementById('skills').innerHTML='';
    my_text = getOfuscated(skill_list[0]);
};

function setNewWord(){
    if( current_word+1 >= skill_list.length){
        current_word = 0;
    }else{
        current_word++;
    };
    my_text = getOfuscated(skill_list[current_word]);
    state = st_write;
}

function writeText(current_text){
    if(current_position < current_text.length){
        let i = 0
        removeAllChildNodes(document.getElementById('skills'));
        while(i <= current_position){
            let tag = document.createElement("span");
            let text = document.createTextNode(current_text[i].nchar);
            tag.classList.add("has-text-light");
            tag.appendChild(text);
            document.getElementById('skills').appendChild(tag);
            i++;
        };
        current_position++;
        if(current_position != current_text.length){
            let tag = document.createElement("span");
            let text = document.createTextNode(underscore_b);
            tag.classList.add("has-text-link");
            tag.appendChild(text);
            document.getElementById('skills').appendChild(tag);
        };
    }else{
        state = st_decipher;
        current_position = 0;
        esperar_por_n_ticks = 0;
    };
};

function decipherText(current_text){
    let i = 0;
    let all_zeros = true;
    esperar_por_n_ticks++;

    removeAllChildNodes(document.getElementById('skills'));

    let tick = esperar_por_n_ticks%4;
    let simbol = '⬖';
    if( tick == 1){simbol = '⬘'}
    if( tick == 2){simbol = '⬗'}
    if( tick == 3){simbol = '⬙'}
    let tag = document.createElement("span");
    let text = document.createTextNode(simbol);
    tag.classList.add("has-text-warning");
    tag.appendChild(text);
    document.getElementById('skills').appendChild(tag);

    
    while(i < current_text.length){
        current_text[i].runs--;
        current_text[i].nchar = String.fromCharCode(current_text[i].nchar.charCodeAt()+2-getRandom(0,1));
        if( current_text[i].runs <= 0 ){
            all_zeros = all_zeros && true;
            let tag = document.createElement("span");
            let text = document.createTextNode(current_text[i].basec);
            tag.classList.add("has-text-warning");
            tag.appendChild(text);
            document.getElementById('skills').appendChild(tag);
            }
        else{
            all_zeros = all_zeros && false;
            let tag = document.createElement("span");
            let text = document.createTextNode(current_text[i].nchar);
            tag.classList.add("has-text-link");
            tag.appendChild(text);
            document.getElementById('skills').appendChild(tag);
            };
        i++;
    };
    
    let tag2 = document.createElement("span");
    let text2 = document.createTextNode(simbol);
    tag2.classList.add("has-text-warning");
    tag2.appendChild(text2);
    document.getElementById('skills').appendChild(tag2);
   
    if(all_zeros){
       // document.getElementById('skills').innerHTML += underscore_a;
        state = st_espera;
        esperar_por_n_ticks = 20;
    };
};

function esperaText(current_text){
    document.getElementById('skills').innerHTML=''
    current_text.forEach(x =>{
        document.getElementById('skills').innerHTML += x.basec;
    })
    if(esperar_por_n_ticks > 0){
        esperar_por_n_ticks--;
        if(esperar_por_n_ticks%4 < 2){
            //document.getElementById('skills').innerHTML += underscore_a;
        }else{
            //document.getElementById('skills').innerHTML += underscore_b;
        };
    }else{
       state = st_delete; // st delete or st decipher
       current_position = current_text.length-1;
    };
};

function deleteText(current_text){
    if(current_position >= 0){
        let i = 0;
        removeAllChildNodes(document.getElementById('skills'));
        while(i < current_position-1){
            document.getElementById('skills').innerHTML += current_text[i].basec;
            i++;
        };
        current_position--;
        let tag = document.createElement("span");
        let text = document.createTextNode(underscore_b);
        tag.classList.add("has-text-danger");
        tag.appendChild(text);
        document.getElementById('skills').appendChild(tag);
    }
    else{
        document.getElementById('skills').innerHTML=''
        document.getElementById('skills').innerHTML += underscore_a;
        state = st_get_next;
    }
};

function updateText(){
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
            setNewWord();
    };
};

startText();
window.setInterval(updateText,75);