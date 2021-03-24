import * as THREE from '/assets/js/three.module.min.js';
import {GLTFLoader} from '/assets/js/GLTFLoader.min.js';
import { MeshoptDecoder } from '/assets/js/meshopt_decoder.module.js';

let renderer;
let camera_hero, scene_hero; // the scene and camera from the hero banner
let monitor = null; // this model goes on hero

let mixer = null;
let dinosaurio = null;
let camera_about, scene_about; 

let pivot_main_camera = null;

const clock = new THREE.Clock();

init();

function init() {

  // everithing is ready to be show, change the color of the hero to is-transparent
  const canvas = document.getElementById('main-canvas');
  renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop( animation );
  renderer.setClearColor( 0x000000, 0 );

  initHeroScene();
  initAboutScene();

  console.log('actualiza hero a is-transparent')
  document.getElementById('hero').classList.remove("is-primary");
  document.getElementById('hero').classList.add("is-transparent");
  //renderer.autoClear = false; // important!
}

function initHeroScene(){
  camera_hero = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 15 );
  camera_hero.position.set(5, 5, 5);
  
  scene_hero = new THREE.Scene();

  pivot_main_camera = new THREE.Object3D();
  pivot_main_camera.position.set(0,1,2);
  pivot_main_camera.add(camera_hero);
  camera_hero.lookAt(0,1,2);

  scene_hero.add(pivot_main_camera);

  //
  //const axesHelper = new THREE.AxesHelper( 5 );
  //scene_hero.add( axesHelper );
  {
    const gltfLoader = new GLTFLoader();
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);
      gltfLoader.load('/assets/main_page/computer_and_desk.glb', (gltf) => {
        let computer = gltf.scene;
        scene_hero.add(computer);
        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera_hero to frame the box
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera_hero);
        },
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
    );
  
      gltfLoader.load('/assets/main_page/dino.glb', (gltf) => {
        dinosaurio = gltf.scene;
        scene_hero.add(dinosaurio);

        mixer = new THREE.AnimationMixer( dinosaurio );
    		const action = mixer.clipAction( gltf.animations[ 0 ] ).play();

        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera_hero to frame the box
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera_hero);
        },
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
    );
  }

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(2, 4, 20);
  scene_hero.add(light);
  scene_hero.add(new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ))

  scene_hero.background = new THREE.Color(0x00d1b2); //0xccf1c2
  
  scene_hero.userData.element = document.getElementById('hero');
};

function initAboutScene(){

  const canvas = document.getElementById('about');

  camera_about = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 0.01, 10 );
  camera_about.position.set(0, 0, 3);
  camera_about.lookAt(0,0,0);
  
  scene_about = new THREE.Scene();

  {
    const gltfLoader = new GLTFLoader();
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);
      gltfLoader.load('/assets/main_page/mp_computer.glb', (gltf) => {
        monitor = gltf.scene;
        scene_about.add(monitor);

        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera_hero to frame the box
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera_about);
        },
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
    );
  }
  
  // build an cube
  /*
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshPhongMaterial({color:0x202040});
  const cube = new THREE.Mesh(geometry, material);
  scene_about.add(cube);
  */

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(2, 4, 20);
  scene_about.add(light);
  scene_about.add(new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ))
  scene_about.background = new THREE.Color(0xcFcFcF); //0xEFEFEF
  scene_about.userData.element = canvas;
};


function animation( time ) {

  if(pivot_main_camera !== null){
    //monitor.rotation.z = time / 1000;
    pivot_main_camera.rotation.y = time / 1500;
  }

  if(monitor !== null){
    monitor.rotation.z = time / 1000;
    monitor.rotation.y = time / 2000;
  }

  var delta = clock.getDelta();
  if ( mixer ) mixer.update( delta );

  render();
}

function render(){
  render_scene(scene_hero, camera_hero, true);
  render_scene(scene_about, camera_about, true);
  //render_scene(scene_footer, camera_footer, false);
  //render_about();
}

function render_scene(scene, camera, is_responsive){

  const canvas = scene.userData.element;
  
  const {left, right, top, bottom, width, height} = canvas.getBoundingClientRect();
  // check if it's offscreen. If so skip it
  if ( bottom < 0 ||
       top > renderer.domElement.clientHeight ||
       right < 0 ||
       left > renderer.domElement.clientWidth) {
    return; // it's off screen
  }

  if (is_responsive){
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

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  };

  // set the viewport
 
  const positiveYUpBottom = canvas.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);
  renderer.setScissorTest( true );

  renderer.render( scene, camera);
}