import * as THREE from '/assets/js/three.module.min.js';
import {GLTFLoader} from '/assets/js/GLTFLoader.min.js';
import { MeshoptDecoder } from '/assets/js/meshopt_decoder.module.js';
import { SkeletonUtils } from '/assets/js/SkeletonUtils.min.js';

let renderer;
let camera_hero, scene_hero; // the scene and camera from the hero banner
let camera_about, scene_about; 
const mixers = [];

let pivot_main_camera = null;
let computer_screen_texture = null;
let digital_trama_texture = null;

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

  //load the models.
  loadModels()

  // console.log('make hero is-transparent')
  //document.getElementById('hero').classList.remove("is-primary");
  //document.getElementById('hero').classList.add("is-transparent");
}

function initHeroScene(){
  camera_hero = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 25 );
  camera_hero.position.set(5, 5, -5);
  
  scene_hero = new THREE.Scene();

  pivot_main_camera = new THREE.Object3D();
  pivot_main_camera.position.set(0,1,2);
  pivot_main_camera.add(camera_hero);
  camera_hero.lookAt(0,1,2);

  scene_hero.add(pivot_main_camera);

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(2, 4, 20);
  scene_hero.add(light);
  scene_hero.add(new THREE.HemisphereLight( 0xcacaca, 0x888888 ))
  
  //scene_hero.background = new THREE.Color(0x00d1b2); //0xccf1c2

  scene_hero.userData.element = document.getElementById('hero');
};

function initAboutScene(){

  const canvas = document.getElementById('about');

  camera_about = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 0.01, 10 );
  camera_about.position.set(3, 5, 7);
  camera_about.lookAt(0,2,0);
  
  scene_about = new THREE.Scene();
  
  scene_about.add(new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ))

  scene_about.background = new THREE.Color(0xacacac); //0xEFEFEF
  
  scene_about.userData.element = canvas;
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


    gltfLoader.load('/assets/main_page/computer_and_desk.glb', (gltf) => {
      scene_hero.add(gltf.scene);
      console.log(dumpObject(gltf.scene).join('\n'));

      computer_screen_texture = gltf.scene.children[0].children[2].material.map;
      
      computer_screen_texture.magFilter  = THREE.NearestFilter;
      computer_screen_texture.minFilter  = THREE.NearestFilter;

      gltf.scene.children[0].children[0].material.map.magFilter  = THREE.NearestFilter;
      gltf.scene.children[0].children[0].material.map.minFilter  = THREE.NearestFilter;
      
      });

    
    gltfLoader.load('/assets/main_page/trama.glb', (gltf) => {
      scene_hero.add(gltf.scene);
      console.log(dumpObject(gltf.scene).join('\n'));
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

      let dinosaurio2 = SkeletonUtils.clone(dinosaurio);
      scene_about.add(dinosaurio2);
      let mixer2 = new THREE.AnimationMixer( dinosaurio2 );
      mixer2.clipAction( gltf.animations[ 1 ] ).play();
      mixers.push(mixer2);

    });  

    /*
    gltfLoader.load('/assets/main_page/mp_computer.glb', (gltf) => {
      monitor = gltf.scene;
      monitor.position.set(0,2,3);
      scene_about.add(monitor);
      });
      */
  };


function animation( time ) {

  /*
  if(pivot_main_camera !== null){
    //monitor.rotation.z = time / 1000;
    pivot_main_camera.rotation.y = time / 1500;
  }
  */
  var delta = clock.getDelta();

 if( computer_screen_texture !== null){
    computer_screen_texture.offset = texture_offsets[animation_frames.getFrameActual()];
    }

  if(digital_trama_texture !== null){
    let offset = digital_trama_texture.offset;
    offset.x = (offset.x + delta*0.25) %1; 
    digital_trama_texture.offset = offset;
  };


  
  mixers.forEach( mixer => { mixer.update( delta ) });

  render();
}

function render(){
  /*
  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;
  */
  

  render_scene(scene_hero, camera_hero);
  //render_scene(scene_about, camera_about, true);

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
  /*
  const positiveYUpBottom = canvas.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);
  renderer.setScissorTest( true );
  */

  renderer.render( scene, camera);
  
  return true;
}


init();
