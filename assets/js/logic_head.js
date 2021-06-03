document.addEventListener('DOMContentLoaded', () => {
 const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
 if ($navbarBurgers.length > 0) {

    // Add a click event on each of them
    $navbarBurgers.forEach( el => {
      el.addEventListener('click', () => {

        // Get the target from the "	" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

      });
    });
  } 
});


const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const text_subtitle_card = document.getElementById('siteSubtitleName').innerHTML
let min_scroll_dist = (isMobile) ? 60 : 200;


min_size = 52; 
let min_size_css = min_size+'px';
let burguer_big_scale = 120.0/min_size;
//console.log(`scale(${burguer_big_scale});`);
//document.getElementById("nav-burger").style.transform = `scale(${burguer_big_scale});`;

function calculateNavBurgerBigSize(){
    var nav_burger = document.getElementById('nav-burger')
    var list_spans = nav_burger.childNodes;
    nav_burger.style.height = '120px';
    if(isMobile){
        nav_burger.style.width = min_size_css;
        for(i=0;i<list_spans.length;i++){
            if(i>0 && i%2==1){
              list_spans[i].style.width = "42px";
              list_spans[i].style.height = "5px";
              list_spans[i].style.left= "5px";
              if(i==1){list_spans[i].style.top = '30px'};
              if(i==3){list_spans[i].style.top = '60px'}; 
              if(i==5){list_spans[i].style.top = '90px'};
           }
        };
    }else{
        nav_burger.style.width = "120px";
        for(i=0;i<list_spans.length;i++){
            if(i>0 && i%2==1){
              list_spans[i].style.width = "90px";
              list_spans[i].style.height = "5px";
               list_spans[i].style.left= "15px";
              if(i==1){list_spans[i].style.top = '30px'};
              if(i==3){list_spans[i].style.top = '60px'}; 
              if(i==5){list_spans[i].style.top = '90px'};
           };
        };
    };
};

calculateNavBurgerBigSize()

function removeSubtitle(){
    if (document.getElementById('siteSubtitleName')){
        document.getElementById('siteSubtitleName').remove();
        // console.log('FUERA!!!');
        };
    };
function addSubtitle(){
    var subtitle = document.createElement("p");
    subtitle.id = "siteSubtitleName";
    subtitle.appendChild(document.createTextNode(text_subtitle_card));
    subtitle.classList.add("subtitle");
    subtitle.classList.add("is-6");
    subtitle.classList.add("added-item");
    subtitle.classList.add("has-text-dark");
    subtitle.classList.add("title_card"); 
    document.getElementById("titleCard").appendChild(subtitle);
    };

let added = false;
let moved_to_body = false;
let first_time_moving = true;

function checkScrollPos(){
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if(scrollTop > min_scroll_dist && ! added){
       document.getElementById('navbar').style.height = min_size_css;
               
       document.getElementById('nav-burger').style.height = min_size_css;
       document.getElementById('nav-burger').style.width = min_size_css;
       
       var list_spans = document.getElementById('nav-burger').childNodes;
        for(i=0;i<list_spans.length;i++){
            if(i>0 && i%2==1){
              list_spans[i].style.width = "34px";
              list_spans[i].style.height = "2px";
              list_spans[i].style.left= "9px";
              if(i==1){list_spans[i].style.top = '13px'};
              if(i==3){list_spans[i].style.top = '26px'}; 
              if(i==5){list_spans[i].style.top = '38px'};
           }
        };

       document.getElementById('titleCard').style.height = min_size_css;
       document.getElementById('titleCard').style.padding = "0.4rem";
       document.getElementById('navbar-brand').style.height = min_size_css;
       document.getElementById('siteSubtitleName').classList.remove("added-item");
       document.getElementById('siteSubtitleName').classList.add("removed-item");
       window.setTimeout(removeSubtitle,370);
       added = true;
    }else if(added && scrollTop < min_scroll_dist){
       document.getElementById('navbar').style.height = '120px';
       document.getElementById('navbar-brand').style.height = '120px';
       calculateNavBurgerBigSize()
       document.getElementById('titleCard').style.height ='100px';
       document.getElementById('titleCard').style.padding = "1.25rem";
       window.setTimeout(addSubtitle,250);
       added = false;
    };
    /*
    This code only is for the main page...
    */
    let hero = document.getElementById('hero');
    if(hero != null){
      let hero_head = document.getElementById('hero-head');
      let domRect = hero.getBoundingClientRect();
      let nav_bar_pos = hero_head.getBoundingClientRect().y;
      let nav_bar_size = (document.getElementById('navbar').getBoundingClientRect().height)*1.15;
      //console.log(nav_bar_pos);
      if((Math.abs(nav_bar_pos)+nav_bar_size)>domRect.height && !moved_to_body){
        // console.log('moved to body');
        moved_to_body = true;
        hero.removeChild(hero_head);
        if(first_time_moving){
          first_time_moving = false;
          let all_post = hero_head.querySelectorAll(".post"); 
          all_post.forEach( x => console.log(x.classList.remove("post")) );
        }
        document.body.insertBefore(hero_head, document.body.firstChild);
      }
      if(moved_to_body){
        if((Math.abs(nav_bar_pos)+nav_bar_size)<domRect.height){
          // console.log('moved to hero');
          moved_to_body = false;
          document.body.removeChild(hero_head);
          hero.insertBefore(hero_head, hero.firstChild);
        }
      }
    
    // keep the clouds away from moving the navburger 
    if(parseInt(document.getElementById('nav-burger').style.width) != 0){
        let size = `${parseInt(window.innerWidth)}px`;  
        navbar.style.width =  size;
    }else{
        let navbar = document.getElementById("navbar-brand");
        navbar.style.width =  'auto';
    }
    
    }
};




window.setInterval(checkScrollPos,10);

