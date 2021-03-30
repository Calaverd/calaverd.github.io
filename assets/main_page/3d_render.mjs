import * as THREE from '/assets/js/three.module.min.js';
import {GLTFLoader} from '/assets/js/GLTFLoader.min.js';
import { MeshoptDecoder } from '/assets/js/meshopt_decoder.module.js';
import { SkeletonUtils } from '/assets/js/SkeletonUtils.min.js';

let renderer;
let camera_hero, scene_hero; // the scene and camera from the hero banner
let camera_about, scene_about; 
let camera_contact, scene_contact; 
let monitor = null;

const mixers = [];

let pivot_main_camera = null;

let computer_screen_texture = null;
let digital_trama_texture = null;
let info_panel_texture = null;

const clock = new THREE.Clock();

function Animation(lista_frames){
    let self = [];
    self.reloj = new THREE.Clock(true);
    self.frame_actual = 0;
    self.periodo = 0.25;
    
    self.getFrameActual = function(){
        if( self.reloj.getElapsedTime() >= self.periodo ){
            self.reloj.start()
            if( lista_frames.length > (self.frame_actual+1) ){
                self.frame_actual += 1;
            } else{
                self.frame_actual = 0;
            }
        }
        return lista_frames[self.frame_actual];
    }

    return self;
}

/*
 Vamos a utilizar el offset de la textura para hacer animación.
 Necesitamos hacer referencia a los frames posibles.
*/
function getFrameList(col, row){
    let frames = [];
    // ;
    let i = 0;
    let j = 0;
    while( i < col ){
        j=0;
        while( j < row ){
            frames.push(new THREE.Vector2(j/row,i/col)); 
            j++;  
            };
        i++;
    };
    return frames;
}  

let texture_offsets = getFrameList(4,4);

// lista de los frames en la textura de esta animación
let base_anim = [];
let anim_write_text = [0,1,2,3,4,5,6,0,1,2,3,4,5,6];
let anim_load_text = [10,12,11,13,10,12,11,10,12,11,13,10,12,11];


Array.prototype.push.apply(base_anim, anim_write_text);
Array.prototype.push.apply(base_anim, anim_load_text);
Array.prototype.push.apply(base_anim, Array(4).fill(7));
Array.prototype.push.apply(base_anim, anim_write_text);
Array.prototype.push.apply(base_anim, anim_load_text);
Array.prototype.push.apply(base_anim, Array(4).fill(8));
Array.prototype.push.apply(base_anim, anim_write_text);
Array.prototype.push.apply(base_anim, anim_load_text);
Array.prototype.push.apply(base_anim, Array(4).fill(9));
Array.prototype.push.apply(base_anim, anim_write_text);
Array.prototype.push.apply(base_anim, anim_load_text);
Array.prototype.push.apply(base_anim, [14,15,14,15,14,15,14,15,14,15]);

let animation_frames = Animation(base_anim);


function init() {

  // everithing is ready to be show, change the color of the hero to is-transparent
  const canvas = document.getElementById('main-canvas');
  renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop( animation );
  renderer.setClearColor( 0x000000, 0 );

  // init the scenes
  initHeroScene();
  initAboutScene();
  initContactScene();

  //load the models.
  loadModels()

  // console.log('make hero is-transparent')
  //document.getElementById('hero').classList.remove("is-primary");
  //document.getElementById('hero').classList.add("is-transparent");
}

let hero_cam_orig = [5,5,-3.5];
let hero_cam_dest = [2,3.5,-2];
let hero_cam_look = [0,3,2];
function initHeroScene(){
  camera_hero = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 25 );
  camera_hero.position.set(hero_cam_orig[0], hero_cam_orig[1], hero_cam_orig[2]);
  
  scene_hero = new THREE.Scene();
  scene_hero.add(camera_hero);
  camera_hero.lookAt(hero_cam_look[0],hero_cam_look[1],hero_cam_look[2]);

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(2,6,-10);
  scene_hero.add(light);
  scene_hero.add(new THREE.HemisphereLight( 0xcacaca, 0x888888 ))
  
  //scene_hero.background = new THREE.Color(0x00d1b2); //0xccf1c2

  scene_hero.userData.element = document.getElementById('hero');
};


let about_cam_orig = [8,7,8];
let about_cam_dest = [5,3,5];
let about_cam_look = [0,1,0];
function initAboutScene(){

  const canvas = document.getElementById('about');

  camera_about = new THREE.PerspectiveCamera( 60, canvas.width / canvas.height, 0.01, 15 );
  camera_about.position.set(about_cam_orig[0], about_cam_orig[1], about_cam_orig[2]);
  camera_about.lookAt(0,1,0);
  
  scene_about = new THREE.Scene();
  
  scene_about.add(new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ))

  scene_about.background = new THREE.Color(0xacacac); //0xEFEFEF

  

  const size = 10;
  const divisions = 10;

  const gridHelper = new THREE.GridHelper( size, divisions );
  scene_about.add( gridHelper );
  /*
  const gridHelper1 = new THREE.GridHelper( size, divisions );
  gridHelper1.rotation.set(90 * (Math.PI/180), 0, 0);
  scene_about.add( gridHelper1 );
  const gridHelper2 = new THREE.GridHelper( size, divisions );
  gridHelper2.rotation.set(0,0, 90 * (Math.PI/180));
  scene_about.add( gridHelper2 );
  */
  const axesHelper = new THREE.AxesHelper( 10 );
  scene_about.add( axesHelper );
  
 
  scene_about.userData.element = canvas;
};

let contact_cam_orig = [6,12,6];
let contact_cam_dest = [4,4,3];
let contact_cam_look = [0,0.5,0];
function initContactScene(){

  const canvas = document.getElementById('contact');

  camera_contact = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 0.01, 15 );
  camera_contact.position.set(contact_cam_orig[0], contact_cam_orig[1], contact_cam_orig[2]);
  camera_contact.lookAt(0,0.5,0);
  
  scene_contact = new THREE.Scene();
  
  scene_contact.add(new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ))

  //scene_contact.background = new THREE.Color(0xacacac); //0xEFEFEF
  
  scene_contact.userData.element = canvas;
};

//* taken from threejsfundamentals at https://threejsfundamentals.org/threejs/lessons/threejs-load-gltf.html
function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}

function loadModels(){

    const gltfLoader = new GLTFLoader();
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    //console.log(dumpObject(gltf.scene).join('\n'));

    gltfLoader.load('/assets/main_page/computer_and_desk.glb', (gltf) => {
      scene_hero.add(gltf.scene);

      computer_screen_texture = gltf.scene.children[0].children[2].material.map;
      
      computer_screen_texture.magFilter  = THREE.NearestFilter;
      computer_screen_texture.minFilter  = THREE.NearestFilter;

      gltf.scene.children[0].children[0].material.map.magFilter  = THREE.NearestFilter;
      gltf.scene.children[0].children[0].material.map.minFilter  = THREE.NearestFilter;
      
      });

    
    gltfLoader.load('/assets/main_page/trama.glb', (gltf) => {
      scene_hero.add(gltf.scene);
      digital_trama_texture = gltf.scene.children[0].material.map;
      digital_trama_texture.magFilter  = THREE.NearestFilter;
      digital_trama_texture.minFilter  = THREE.NearestFilter;

      });
    
    gltfLoader.load('/assets/main_page/dino.glb', (gltf) => {
      let dinosaurio = gltf.scene;
      scene_hero.add(dinosaurio);

      let mixer1 = new THREE.AnimationMixer( dinosaurio );
      mixer1.clipAction( gltf.animations[ 0 ] ).play();
      mixers.push(mixer1);
    });  
    
    gltfLoader.load('/assets/main_page/info.glb', (gltf) => {
      scene_about.add(gltf.scene);

      var geo = new THREE.EdgesGeometry( gltf.scene.children[0].geometry ); // or WireframeGeometry
      var mat = new THREE.LineBasicMaterial( { color: 0x000000 } );
      var wireframe = new THREE.LineSegments( geo, mat );
      gltf.scene.add( wireframe );

      info_panel_texture = gltf.scene.children[0].material.map;
      info_panel_texture.magFilter  = THREE.NearestFilter;
      info_panel_texture.minFilter  = THREE.NearestFilter;
      });
    
    gltfLoader.load('/assets/main_page/mp_computer.glb', (gltf) => {
      monitor = gltf.scene;
      monitor.position.set(0,2,0);
      scene_about.add(monitor);
      });

    gltfLoader.load('/assets/main_page/contact_bird.glb', (gltf) => {
      scene_contact.add(gltf.scene);

      let mixer1 = new THREE.AnimationMixer( gltf.scene );
      mixer1.clipAction( gltf.animations[ 0 ] ).play();
      mixers.push(mixer1);
      });

  };


function animation( time ) {
  
  
  var delta = clock.getDelta();

  if( computer_screen_texture !== null){
    computer_screen_texture.offset = texture_offsets[animation_frames.getFrameActual()];
  };

  
  if(monitor !== null) {
    monitor.rotation.y = time/1005;
    monitor.rotation.z = time/2008;
    monitor.rotation.x = time/3007;  
  };

  if(digital_trama_texture !== null){
    let offset = digital_trama_texture.offset;
    offset.x = (offset.x + delta*0.25) %1; 
    digital_trama_texture.offset = offset;
  };
  
  if(info_panel_texture !== null ){
    let offset = info_panel_texture.offset;
    offset.x = (offset.x - delta*0.15) %1; 
    info_panel_texture.offset = offset;
  };


  
  mixers.forEach( mixer => { mixer.update( delta ) });

  render();
}

let is_hero_rendering = false;
let is_about_rendering = false;
let is_contact_rendering = false;
function render(){
  
  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;
  
  is_hero_rendering = render_scene(scene_hero, camera_hero);
  is_about_rendering = render_scene(scene_about, camera_about);
  is_contact_rendering = render_scene(scene_contact, camera_contact);
}


function render_scene(scene, camera){

  const canvas = scene.userData.element;
  const {left, right, top, bottom, width, height} = canvas.getBoundingClientRect();

  if (canvas.width != window.innerWidth || canvas.height != window.innerHeight ){
    if (canvas.width != window.innerWidth){
        canvas.width  = window.innerWidth;
        canvas.style.width = window.innerWidth+"px";
    }
    if (canvas.height != window.innerHeight){
        canvas.height = window.innerHeight;
        canvas.style.height = window.innerHeight+"px";
    }
  }

  if( (top + renderer.domElement.clientHeight) < 0 ||
    (top >= renderer.domElement.clientHeight) ){ 
    return false; // it's off screen
    }

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

  // set the viewport
  const positiveYUpBottom = canvas.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);
  renderer.setScissorTest( true );

  renderer.render( scene, camera);
  
  return true;
}

function getNewPos(act_post, orign, dest, dt){
  let maxi = Math.max(dest,orign);
  let mini = Math.min(dest,orign);
  dt = dest>=orign ? dt : -dt;
  return Math.max(Math.min(act_post + dt, maxi), mini);
}

function moveCamera(camera, original, destino, dt, cam_look){
  camera.position.y = getNewPos(camera.position.y, original[1], destino[1], dt);
  camera.position.x = getNewPos(camera.position.x, original[0], destino[0], dt);
  camera.position.z = getNewPos(camera.position.z, original[2], destino[2], dt);
  camera.lookAt(cam_look[0],cam_look[1],cam_look[2]);
};

let lastScrollTop = 0;
function updateCamera(ev) {
  let factor = window.scrollY / (document.body.scrollHeight-window.innerHeight);
  let st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
  let dt = 0.25 * factor;
  if (st <= lastScrollTop){
     dt = -0.25 * factor;
  }
  lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
  
  if(is_hero_rendering){
  	moveCamera(camera_hero, hero_cam_orig, hero_cam_dest, dt, hero_cam_look);
  }
  if(is_about_rendering){
    moveCamera(camera_about, about_cam_orig, about_cam_dest, dt, about_cam_look);
  }
  if(is_contact_rendering){
    moveCamera(camera_contact, contact_cam_orig, contact_cam_dest, dt, contact_cam_look);
  }
  //camera_about.lookAt(0,1,0);
}

window.addEventListener("scroll", updateCamera);


init();
