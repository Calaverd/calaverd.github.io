import * as THREE from '/assets/js/three.module.min.js';
import {GLTFLoader} from '/assets/js/GLTFLoader.min.js';
import { MeshoptDecoder } from '/assets/js/meshopt_decoder.module.js';
// import { SkeletonUtils } from '/assets/js/SkeletonUtils.min.js';

let renderer;
let camera_hero, scene_hero; // the scene and camera from the hero banner
let camera_about, scene_about; 
let camera_contact, scene_contact;

let is_hero_rendering = false;
let is_about_rendering = false;
let is_contact_rendering = false;

// this are some variables made to control the camera postion on scroll for each scene
let hero_cam_orig = [10,1,3];
let hero_cam_dest = [12,3,-1];
let hero_cam_look = [0,-3,-0.5];

let about_cam_orig = [8,7,8];
let about_cam_dest = [5,3,5];
let about_cam_look = [0,1,0];

let contact_cam_orig = [6,12,6];
let contact_cam_dest = [4,4,3];
let contact_cam_look = [0,0.5,0];


// This are for the objects that will be animated but are not loaded yet
let monitor = null;
let info_panel_texture = null;
let goji_plane = null;
let bird_contact = null;


const mixers = [];

// create alist of frames to play for the animation of the computer screen

let base_anim = [];
let anim_write_text = [0,1,2,3,4,5,6,0,1,2,3,4,5,6];
let anim_load_text = [10,12,11,13,10,12,11,10,12,11,13,10,12,11];

// merge the frames
Array.prototype.push.apply(base_anim, anim_write_text);
Array.prototype.push.apply(base_anim, anim_load_text);
Array.prototype.push.apply(base_anim, Array(4).fill(7)); // the curectangles screen
Array.prototype.push.apply(base_anim, anim_write_text);
Array.prototype.push.apply(base_anim, anim_load_text);
Array.prototype.push.apply(base_anim, Array(4).fill(8)); // the graph screen
Array.prototype.push.apply(base_anim, anim_write_text);
Array.prototype.push.apply(base_anim, anim_load_text);
Array.prototype.push.apply(base_anim, Array(4).fill(9)); // the another graph screen
Array.prototype.push.apply(base_anim, anim_write_text);
Array.prototype.push.apply(base_anim, anim_load_text);
Array.prototype.push.apply(base_anim, [14,15,14,15,14,15,14,15,14,15]); // the pacman

let animation_frames = AnimationFrames(base_anim);
let texture_offsets = getFrameList(4,4);

/*
  Here are a set of helper functions to animate a texture like a sprite sheet. 
*/

const clock = new THREE.Clock();

function AnimationFrames(lista_frames){
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
 Whe are gonna use the offset from the texture to do de animation.
 We need to do a reference to all the posible frames on the texture.
*/
function getFrameList(col, row){
    let frames = [];
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


/*
   This functions here control the camera movement on scroll
*/

function getNewPos(act_post, orign, dest, dt){
  let maxi = Math.max(dest,orign);
  let mini = Math.min(dest,orign);
  dt = dest >= orign ? dt : -dt; // determine towards what value we are going
  return Math.max(Math.min(act_post + dt, maxi), mini);
}

function moveCamera(camera, original, destino, dt, cam_look){
  camera.position.y = getNewPos(camera.position.y, original[1], destino[1], dt);
  camera.position.x = getNewPos(camera.position.x, original[0], destino[0], dt);
  camera.position.z = getNewPos(camera.position.z, original[2], destino[2], dt);
  camera.lookAt(cam_look[0],cam_look[1],cam_look[2]);
};

let lastScrollTop = 0;
// a listener on scrooll for this function is added at the end of this file.
function updateCamera(ev) {
  let factor = window.scrollY / (document.body.scrollHeight-window.innerHeight);
  let st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
  let dt = 0.25 * factor;
  if (st <= lastScrollTop){
     dt = -0.25 * factor;
  }
  lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
  
  if(is_hero_rendering){
  	moveCamera(camera_hero, hero_cam_orig, hero_cam_dest, dt*2, hero_cam_look);
  }
  if(is_about_rendering){
    moveCamera(camera_about, about_cam_orig, about_cam_dest, dt, about_cam_look);
  }
  if(is_contact_rendering){
    moveCamera(camera_contact, contact_cam_orig, contact_cam_dest, dt, contact_cam_look);
  }
  //camera_about.lookAt(0,1,0);
}


//* taken from threejsfundamentals at https://threejsfundamentals.org/threejs/lessons/threejs-load-gltf.html
// use for debug of the models

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

/*
  Load the models and add each one to their scenes. 
  This is called once all scenes were initialized.
*/

function loadModels(){

  const gltfLoader = new GLTFLoader();
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  
  gltfLoader.load('/assets/main_page/goji_pilot_c.glb', (gltf) => {
    scene_hero.add(gltf.scene);
    // console.log(dumpObject(gltf.scene));
    
    goji_plane = gltf.scene;
    
    let mixer1 = new THREE.AnimationMixer( gltf.scene );
    mixer1.clipAction( gltf.animations[ 0 ] ).play();
    mixers.push(mixer1);
    
    
    gltfLoader.load('/assets/main_page/info.glb', (gltf) => {
        scene_about.add(gltf.scene);

        // the black outline of the info charts is just the wireframe
        let geo = new THREE.EdgesGeometry( gltf.scene.children[0].geometry ); // or WireframeGeometry
        let mat = new THREE.LineBasicMaterial( { color: 0x000000 } );
        let wireframe = new THREE.LineSegments( geo, mat );
        gltf.scene.add( wireframe );

        info_panel_texture = gltf.scene.children[0].material.map;
        gltf.scene.children[0].material.needsUpdate = true;
        info_panel_texture.magFilter  = THREE.NearestFilter;
        info_panel_texture.minFilter  = THREE.NearestFilter;
        info_panel_texture.needsUpdate = true;
        
        });
    
      gltfLoader.load('/assets/main_page/mp_computer.glb', (gltf) => {
        monitor = gltf.scene;
        monitor.position.set(0,2,0);
        scene_about.add(monitor);
        
        gltfLoader.load('/assets/main_page/contact_bird.glb', (gltf) => {
            scene_contact.add(gltf.scene);
            bird_contact = gltf.scene;
            let mixer1 = new THREE.AnimationMixer( gltf.scene );
            mixer1.clipAction( gltf.animations[ 0 ] ).play();
            mixers.push(mixer1);
            });   
        });
    
  });
};

/*
  Setup each scene, so thet are ready to use.
*/
function initHeroScene(){
  camera_hero = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 25 );
  camera_hero.position.set(hero_cam_orig[0], hero_cam_orig[1], hero_cam_orig[2]);
  
  scene_hero = new THREE.Scene();
  scene_hero.add(camera_hero);
  camera_hero.lookAt(hero_cam_look[0],hero_cam_look[1],hero_cam_look[2]);

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(2,6,-10);
  scene_hero.add(light);
  
  const light2 = new THREE.DirectionalLight(0xFFFFFF, 1);
  light2.position.set(0,2,10);
  scene_hero.add(light2);
  
  scene_hero.add(new THREE.HemisphereLight( 0xcacaca, 0x888888 ))
  
  //scene_hero.background = new THREE.Color(0x00d1b2); //0xccf1c2

  scene_hero.userData.element = document.getElementById('hero');
};

function initAboutScene(){

  const canvas = document.getElementById('about');

  camera_about = new THREE.PerspectiveCamera( 60, canvas.width / canvas.height, 0.01, 15 );
  camera_about.position.set(about_cam_orig[0], about_cam_orig[1], about_cam_orig[2]);
  camera_about.lookAt(about_cam_look[0],about_cam_look[1],about_cam_look[2]);
  
  scene_about = new THREE.Scene();
  
  scene_about.add(new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ))

  scene_about.userData.element = canvas;
};


function initContactScene(){

  const canvas = document.getElementById('contact');

  camera_contact = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 0.01,16);
  camera_contact.position.set(contact_cam_orig[0], contact_cam_orig[1], contact_cam_orig[2]);
  camera_contact.lookAt(contact_cam_look[0],contact_cam_look[1],contact_cam_look[2]);
  
  scene_contact = new THREE.Scene();
  
  scene_contact.add(new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ))
  
  scene_contact.userData.element = canvas;
};

/*
 Main animation loop.
*/
function mainAnimation( time ) {
  
  let delta = clock.getDelta();

  // animate the monitor on the about scene
  if(monitor !== null) {
    monitor.rotation.y = time/1005;
    monitor.rotation.z = time/2008;
    monitor.rotation.x = time/3007;  
  };
  
  if(goji_plane !== null){
    const delta = (3.5 * Math.sin(Math.PI * 2 * time/5000)) -3.5;
    const delta2 = (1 * Math.sin(Math.PI * 2 * time/5000));
    const delta3 = (3 * Math.sin(Math.PI * 2 * time/10000)-2);
    goji_plane.position.y = delta;
    goji_plane.position.z = delta2;
    goji_plane.position.x = delta3;
  };
  
  // animate the text and gaujes of the about scene 
  if(info_panel_texture !== null ){
    let offset = info_panel_texture.offset;
    offset.x = (offset.x - delta*0.15) %1; 
    info_panel_texture.offset = offset;
  };

  // run each one of the skeletical animations.
  mixers.forEach( mixer => { mixer.update( delta ) });

  render();
}

/*
  Get the container of the scene, and render it only if is visible on screen
*/
var rscanvas = null;

function render_scene(scene, camera){

  rscanvas = scene.userData.element;
  const {left, top, bottom, width, height} = rscanvas.getBoundingClientRect();

  if (rscanvas.width != window.innerWidth || rscanvas.height != window.innerHeight ){
    if (rscanvas.width != window.innerWidth){
        rscanvas.width  = window.innerWidth;
        rscanvas.style.width = window.innerWidth+"px";
    }
    if (rscanvas.height != window.innerHeight){
        rscanvas.height = window.innerHeight;
        rscanvas.style.height = window.innerHeight+"px";
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
  const positiveYUpBottom = rscanvas.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);
  renderer.setScissorTest( true );

  renderer.render( scene, camera);
  
  return true;
}

function render(){
  
  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;
  
  // only render if all models are aready loaded...
  if(goji_plane !== null &&  bird_contact !== null && monitor !== null ){
      is_hero_rendering = render_scene(scene_hero, camera_hero);
      is_about_rendering = render_scene(scene_about, camera_about);
      is_contact_rendering = render_scene(scene_contact, camera_contact);
    }
}

// taken from https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
  await sleep(1500);
  renderer = new THREE.WebGLRenderer(
    {canvas: document.getElementById('main-canvas'),
     antialias: true, alpha: true});
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop( mainAnimation );
  renderer.setClearColor( 0x000000, 0 );
  
  // init the scenes
  await sleep(100);
  initHeroScene();
  
  await sleep(100);
  initAboutScene();
  
  await sleep(100);
  initContactScene();

  //load the models.
  await sleep(500);
  loadModels();
  
  window.addEventListener("scroll", updateCamera);
}


init();
