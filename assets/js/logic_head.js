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
        console.log('FUERA!!!');
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
};

window.setInterval(checkScrollPos,0.5);
