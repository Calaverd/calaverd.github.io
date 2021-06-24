// dinosaur plane animation

let helix1 = document.getElementById('helix1');
let helix2 = document.getElementById('helix2');

let frames = [helix1, helix2];
let frame = 0;

helix2.style.visibility = "hidden"

// monitor about animation

let taken_places = [];
let place_list = [0,1,2,3,4,5,6];
let directions = ["to_20","to_45","to_60","to_90","to_110","to_135","to_160"];
let ctr_monitor = document.getElementById('ctr-monitor');

let center_shoot = [...document.getElementsByClassName("center-shoot")];
let star_list = center_shoot.slice(center_shoot.length-3);
let logo_list = center_shoot.slice(0,center_shoot.length-4);
let num_logos = logo_list.length;
let logos_to_take = [...logo_list.keys()];

let crt_text = [...ctr_monitor.getElementsByTagName("g")[1].getElementsByTagName("rect")];
let current_ctr_text = 0;

// hay que odernarlas de arriba abajo, derecha a izquierda
crt_text.forEach( x => { x.style.visibility = "hidden"; });
crt_text.sort((a, b) => (a.getAttribute("y") > b.getAttribute("y")) ? 1 : -1);

function shuffle(list){
    let taken = list.length;
    while(taken > 0){
        let num = Math.floor(Math.random()*taken);
        list.push(list.splice(num, 1)[0]);
        taken -=1
        }
    return list;
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

function startLogoAnimations(){
    for(i=0;i<place_list.length;i++){
        if(taken_places[i]){
            let dir = taken_places[i][0];
            let object = taken_places[i][1];
            object.classList.remove(dir);
            taken_places[i] = false
        }
    }

    place_list = shuffle(place_list);
    logos_to_take = shuffle(logos_to_take);
    
    // escoje 3 logos entre los que hay y ponlos en lugares no tomados
    let taken = 0;
    let curren_place = 0;
    while(taken<4){
        let num = logos_to_take[taken]
        let place = place_list[curren_place];
        logo_list[num].classList.add(directions[place]);
        // save place direction and object
        taken_places[place] = [directions[place],logo_list[num]]
        taken +=1
        curren_place+=1;
    }

    // agrega las estrellas...
    taken = 0;
    while(taken<3){  
        let place = place_list[curren_place];
        star_list[taken].classList.add(directions[place]);
        // save place direction and object
        taken_places[place] = [directions[place],star_list[taken]]
        taken += 1;
        curren_place+=1;
    }
}


window.setInterval(runFrameAnimations,100);
// CRT animation text
ctr_monitor.addEventListener("animationstart", startLogoAnimations, false);
ctr_monitor.addEventListener("animationiteration", startLogoAnimations, false);