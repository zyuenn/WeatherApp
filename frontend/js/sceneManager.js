import * as THREE from "/node_modules/three/build/three.module.js";
import { OrbitControls } from "/node_modules/three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "/node_modules/three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "/node_modules/three/examples/jsm/loaders/MTLLoader.js";

console.log("Weather App - Scene Manager Loaded");

let scene, camera, renderer, controls;

// Scene initialization
export function initScene(canvas) {
  // SETUP RENDERER & SCENE
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xd0f0d0);
  canvas.appendChild(renderer.domElement);

  // SETUP CAMERA
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(40, 40, 40);
  camera.lookAt(0, 15, 0);
  scene.add(camera);

  // SETUP ORBIT CONTROLS OF THE CAMERA
  controls = new OrbitControls(camera, renderer.domElement);
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5; 

  controls.target.set(0, 15, 0);
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 3;

  // SET UP SOIL TILES
  const tileWidth = 25;
  const tileDepth = 25;
  const tileHeight = 1;
  const soilColors = [0x855615, 0xd7b56b, 0x668d2e];

  for (let i = 0; i < 3; i++) {
    const geometry = new THREE.BoxGeometry(tileWidth, tileHeight, tileDepth);
    const material = new THREE.MeshStandardMaterial({ color: soilColors[i] });
    const tile = new THREE.Mesh(geometry, material);
    tile.castShadow = true;
    tile.position.set(0, (i - 1) * tileHeight, 0);
    scene.add(tile);
  }

  // ENABLED SHADOWS
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // SHADOW RECEIVING PLANES
  const planeGeometry = new THREE.PlaneGeometry(500, 500);
  const planeMaterial = new THREE.ShadowMaterial({
    opacity: 0.5,
    transparent: true,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -1.5, 0);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);

  const plane2Geometry = new THREE.PlaneGeometry(25, 25);
  const plane2 = new THREE.Mesh(plane2Geometry, planeMaterial);
  plane2.position.set(0, 1.51, 0);
  plane2.rotation.x = -Math.PI / 2;
  plane2.receiveShadow = true;
  scene.add(plane2);

  // DIRECTIONAL SUNLIGHT
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  sunLight.castShadow = true;
  sunLight.name = "sunLight";
  sunLight.position.set(0, 50, 50);
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;

  // SHADOW SETTINGS
  sunLight.shadow.camera.left = -50;
  sunLight.shadow.camera.right = 50;
  sunLight.shadow.camera.top = 50;
  sunLight.shadow.camera.bottom = -50;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 200;
  scene.add(sunLight);

  // DIRECTIONAL MOONLIGHT with bluish tint
  const moonLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  moonLight.castShadow = true;
  moonLight.name = "moonLight";
  moonLight.position.set(-20, 30, -20);
  scene.add(moonLight);

  // AMBIENT LIGHTING 
  const ambientLight = new THREE.AmbientLight(0x222222);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);

  // VISIBLE SUN (YELLOW SPHERE)
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  );
  sunMesh.name = "sunMesh";
  sunMesh.position.copy(sunLight.position);
  sunMesh.castShadow = true;
  sunMesh.receiveShadow = true;
  scene.add(sunMesh);

  // ADAPT TO WINDOW RESIZE
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  // EVENT LISTENER RESIZE
  window.addEventListener("resize", resize);
  resize();

  //SCROLLBAR FUNCTION DISABLE
  window.onscroll = () => window.scrollTo(0, 0);
}

// Load object and material model into scene with specified options
export function loadModelWithMaterials(scene, objPath, mtlPath, options = {}) {
  const mtlLoader = new MTLLoader();
  mtlLoader.setPath(mtlPath);
  mtlLoader.load("materials.mtl", function (materials) {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load(
      objPath,
      (object) => {
        const scale = options.scale || 1;
        const position = options.position || new THREE.Vector3(0, 0, 0);
        const rotation = options.rotation || new THREE.Vector3(0, 0, 0);

        object.scale.set(scale, scale, scale);
        object.position.copy(position);
        object.rotation.set(rotation.x, rotation.y, rotation.z);

        // Set the object to cast shadows
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
          }
        });

        if (options.name) {
          object.name = options.name;
        }
        scene.add(object);
      },
      // called when loading is in progress
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        console.log("An error happened");
      },
    );
  });
}

// Load object model into scene
export function setScene(scene) {
  // Grass Patch by Danni Bittman [CC-BY] via Poly Pizza
  loadModelWithMaterials(
    scene,
    "/3d-model/grassPatch/model.obj",
    "/3d-model/grassPatch/",
    {
      scale: 5,
      position: new THREE.Vector3(0, 2, 0),
    },
  );
  loadModelWithMaterials(
    scene,
    "/3d-model/grassPatch/model.obj",
    "/3d-model/grassPatch/",
    {
      scale: 5,
      position: new THREE.Vector3(6, 2, 5),
      rotation: new THREE.Vector3(0, 2 * Math.PI, 0),
      name: "grass",
    },
  );
  loadModelWithMaterials(
    scene,
    "/3d-model/grassPatch/model.obj",
    "/3d-model/grassPatch/",
    {
      scale: 5,
      position: new THREE.Vector3(5, 1.5, -5),
    },
  );
  loadModelWithMaterials(
    scene,
    "/3d-model/grassPatch/model.obj",
    "/3d-model/grassPatch/",
    {
      scale: 5,
      position: new THREE.Vector3(-5, 1.5, 5),
    },
  );
  // Tree-2 by Marc Solà [CC-BY] via Poly Pizza
  loadModelWithMaterials(scene, "/3d-model/tree/model.obj", "/3d-model/tree/", {
    scale: 10,
    position: new THREE.Vector3(0, 17, 0),
    rotation: new THREE.Vector3(0, Math.PI / 2, 0),
  });
}

// Returns components of the scene for external use
export function getSceneComponents() {
  return { scene, camera, renderer, controls };
}
