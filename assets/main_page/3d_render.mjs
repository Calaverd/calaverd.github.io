import * as THREE from '/assets/js/three.module.min.js';
import {GLTFLoader} from '/assets/js/GLTFLoader.min.js';

let renderer;
let camera_hero, scene_hero; // the scene and camera from the hero banner

let monitor = null;

init();

function init() {

  camera_hero = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
  camera_hero.position.set(0, 0, 3);
  camera_hero.lookAt(0,0,0);

  scene_hero = new THREE.Scene();

  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/assets/main_page/mp_computer.glb', (gltf) => {
      monitor = gltf.scene;
      scene_hero.add(monitor);

      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // set the camera_hero to frame the box
      frameArea(boxSize * 0.5, boxSize, boxCenter, camera_hero);
    });
  }

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(2, 4, 20);
  scene_hero.add(light);
  scene_hero.add(new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ))
  //const axesHelper = new THREE.AxesHelper( 5 );
  //scene_hero.add( axesHelper );

  scene_hero.background = new THREE.Color(0x00d1b2);

  const canvas = document.getElementById('computer-canvas');
  renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop( animation );
  document.body.appendChild( renderer.domElement );

  // everithing is ready to be show, change the color of the hero to is-transparent
  console.log('actualiza hero a is-transparent')
  document.getElementById('hero').classList.remove("is-primary");
  document.getElementById('hero').classList.add("is-transparent");

}

function animation( time ) {

  if(monitor != null){
    monitor.rotation.z = time / 1000;
    monitor.rotation.y = time / 2000;
  }

  render();
}

function render(){
  render_hero();
}

function render_hero(){
  const canvas = document.getElementById('computer-canvas');

  // get its position relative to the page's viewport
  const rect = canvas.getBoundingClientRect();

  // check if it's offscreen. If so skip it
  if ( rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
     rect.right < 0 || rect.left > renderer.domElement.clientWidth ) {

    return; // it's off screen

  }

  // set the viewport 
  // esto crea la ilusión de que el monitor esta fijo a la pagina
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  const left = rect.left;
  const bottom = renderer.domElement.clientHeight - rect.bottom;

  renderer.setViewport( left, bottom, width, height );
  renderer.setScissor( left, bottom, width, height );

  if (canvas.width != window.innerWidth || canvas.height != window.innerHeight ){
    if (canvas.width != window.innerWidth){
        canvas.width  = window.innerWidth;
        canvas.style.width = window.innerWidth+"px";
    }
    if (canvas.height != window.innerHeight){
        canvas.height = window.innerHeight;
        canvas.style.height = window.innerHeight+"px";
    }
    camera_hero.aspect = window.innerWidth / window.innerHeight;
    camera_hero.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  };


  renderer.render( scene_hero, camera_hero );
}