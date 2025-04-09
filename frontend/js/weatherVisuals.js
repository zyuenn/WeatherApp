import * as THREE from "/node_modules/three/build/three.module.js";
import { OrbitControls } from "/node_modules/three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "/node_modules/three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "/node_modules/three/examples/jsm/loaders/MTLLoader.js";
import { loadModelWithMaterials } from "./sceneManager.js";

let rainSystem;

// Based on weather.main
// Apply weather conditions to the scene
// This function modifies the scene's background color and adds/removes
// weather effects (clouds, rain, etc.) based on the provided weather condition.
export function applyWeatherMain(weatherMain, scene) {
  const cloudGroup = scene.getObjectByName("cloudGroup");

  if (cloudGroup) cloudGroup.visible = false;
  if (rainSystem) rainSystem.visible = false;

  switch (weatherMain) {
    case "Clear":
      scene.background = new THREE.Color(0x87ceeb);
      if (cloudGroup) cloudGroup.visible = false;
      if (rainSystem) rainSystem.visible = false;
      break;
    case "Clouds":
      scene.background = new THREE.Color(0xb0c4de);
      applyWeatherClouds(scene);
      if (cloudGroup) cloudGroup.visible = true;
      if (rainSystem) rainSystem.visible = false;
      break;
    case "Rain":
      scene.background = new THREE.Color(0x778899);
      applyRain(scene, {
        rainAmount: 1000,
      });
      if (rainSystem) rainSystem.visible = true;
      applyWeatherClouds(scene);
      if (cloudGroup) cloudGroup.visible = true;
      break;
    case "Snow":
      scene.background = new THREE.Color(0xf0f8ff);
      applyRain(scene, {
        rainAmount: 500,
        color: 0xffffff,
        size: 0.7,
        opacity: 0.9,
      });
      if (rainSystem) rainSystem.visible = true;
      applyWeatherClouds(scene);
      if (cloudGroup) cloudGroup.visible = true;
      break;
    case "Drizzle":
      scene.background = new THREE.Color(0x778899);
      applyRain(scene, {
        rainAmount: 50,
        size: 0.3,
        opacity: 0.5,
      });
      if (rainSystem) rainSystem.visible = true;
      applyWeatherClouds(scene);
      if (cloudGroup) cloudGroup.visible = true;
      break;
    case "Thunderstorm":
      scene.background = new THREE.Color(0x2f4f4f);
      applyRain(scene, {
        rainAmount: 2500,
      });
      if (rainSystem) rainSystem.visible = true;
      applyWeatherClouds(scene);
      if (cloudGroup) cloudGroup.visible = true;
      break;

    // Possible weather conditions to include in the future
    // case 'Mist':
    // case 'Smoke':
    // case 'Dust':
    // case 'Fog':
    // case 'Sand':
    // case 'Ash':
    // case 'Squall':
    // case 'Tornado':
    //     break;
    default:
      if (cloudGroup) cloudGroup.visible = false;
      if (rainSystem) rainSystem.visible = false;
      scene.background = new THREE.Color(0xcccccc);
  }
}

// Apply hourly temperature of the scene
// This function modifies the scene's lighting based on the provided temperature.
export function applyWeatherTemperature(temp, scene) {
  let warmth = Math.max(0, Math.min(1, (temp - 5) / 25)); // normalize between 0 and 1

  // Create a warm/cool light tint
  const lightColor = new THREE.Color().lerpColors(
    new THREE.Color(0x3399ff), // cool blue
    new THREE.Color(0xffcc66), // warm orange
    warmth,
  );

  // Add light that reflects temperature
  const tempLight = new THREE.HemisphereLight(lightColor, 0x000000, 0.5);
  tempLight.name = "TempLight";

  // Remove any previous temp light
  const old = scene.getObjectByName("TempLight");
  if (old) scene.remove(old);

  scene.add(tempLight);
}

// Apply sunset/sunrise of the scene
export function applySun(dt, sunrise, sunset, scene) {
  const oneHour = 60 * 60;
  const timeOfDay = dt;

  const morningStart = sunrise;
  const morningEnd = sunrise + oneHour;
  const eveningStart = sunset - oneHour;
  const eveningEnd = sunset;

  const daylightStart = morningEnd;
  const daylightEnd = eveningStart;

  // Determine the time of day
  const isNight = timeOfDay < morningStart || timeOfDay > eveningEnd;
  const isMorning = timeOfDay >= morningStart && timeOfDay <= morningEnd;
  const isEvening = timeOfDay >= eveningStart && timeOfDay <= eveningEnd;
  const isDay = timeOfDay >= daylightStart && timeOfDay <= daylightEnd;

  const sun = scene.getObjectByName("sunLight");
  const moon = scene.getObjectByName("moonLight");
  const ambientLight = scene.getObjectByName("ambientLight");

  // Based on the time of day, adjust the sun and moon visibility and color
  if (isNight) {
    sun.visible = 0.0;
    moon.visible = 1.0;
    ambientLight.color.setHex(0x111133);
  } else if (isMorning || isEvening) {
    sun.visible = 1.0;
    moon.visible = 0.0;
    sun.color.set(0xff8c42); // orange/pink hue
    sun.position.set(30, 20, 0);
    ambientLight.color.setHex(0x442222); // warmer tone
  } else if (isDay) {
    sun.visible = 1.0;
    moon.visible = 0.0;
    sun.color.set(0xffffcc); // bright sunlight
    ambientLight.color.setHex(0xffffff); // bright ambient
    // sun position moves throughout day
    const progress =
      (timeOfDay - daylightStart) / (daylightEnd - daylightStart); // 0 to 1
    const angle = progress * Math.PI; // simulate arc in sky
    const x = Math.cos(angle) * 50;
    const y = Math.sin(angle) * 50;
    sun.position.set(x, y, 0);
  }
}

// Apply clouds to the scene
export function applyWeatherClouds(scene) {
  var cloudGroup = scene.getObjectByName("cloudGroup");
  if (cloudGroup) scene.remove(cloudGroup);

  cloudGroup = new THREE.Group();
  cloudGroup.name = "cloudGroup";
  // Cumulus Clouds 2 by S. Paul Michael [CC-BY] via Poly Pizza
  loadModelWithMaterials(
    cloudGroup,
    "/3d-model/clouds/model.obj",
    "/3d-model/clouds/",
    {
      scale: 5,
      position: new THREE.Vector3(-6, 30, 0),
    },
  );
  loadModelWithMaterials(
    cloudGroup,
    "/3d-model/clouds/model.obj",
    "/3d-model/clouds/",
    {
      scale: 3,
      position: new THREE.Vector3(-3, 34, -12),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
    },
  );
  loadModelWithMaterials(
    cloudGroup,
    "/3d-model/clouds/model.obj",
    "/3d-model/clouds/",
    {
      scale: 3,
      position: new THREE.Vector3(10, 30, 12),
      rotation: new THREE.Vector3(0, Math.PI, 0),
    },
  );
  scene.add(cloudGroup);
}

// Apply rain to the scene
// This function creates a rain effect using a particle system.
// It generates a specified number of particles and adds them to the scene.
export function applyRain(scene, options = {}) {
  if (rainSystem) scene.remove(rainSystem);
  
  // Create a rain particle system
  const rainGeo = new THREE.BufferGeometry();
  const positions = [];

  const rainAmount = options.rainAmount || 1000;
  const color = options.color || 0xebf7fb;
  const size = options.size || 0.3;
  const opacity = options.opacity || 0.5;

  for (let i = 0; i < rainAmount; i++) {
    const x = Math.random() * 25 - 12.5;
    const y = Math.random() * 25;
    const z = Math.random() * 25 - 12.5;
    positions.push(x, y, z);
  }

  // Create a buffer attribute for the positions
  rainGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );

  const rainMaterial = new THREE.PointsMaterial({
    color: color,
    size: size,
    transparent: true,
    opacity: opacity,
    depthWrite: false,
  });

  rainSystem = new THREE.Points(rainGeo, rainMaterial);
  rainSystem.castShadow = true;
  rainSystem.name = "rainSystem";

  scene.add(rainSystem);
}

// Animate clouds in the scene
export function animateClouds(scene, deltaTime) {
  const cloudGroup = scene.getObjectByName("cloudGroup");
  if (!cloudGroup) {
    console.log("CloudGroup not found");
    return;
  }

  cloudGroup.children.forEach((cloud) => {
    cloud.position.x += 0.5 * deltaTime;
    if (cloud.position.x > 12.5) {
      cloud.position.x = -12.5;
    }
  });
}

// Animate rain in the scene
// This function updates the positions of the rain particles over time,
// creating a falling effect. It also resets the position of particles
// that have fallen below a certain threshold.
export function animateRain(deltaTime) {
  if (!rainSystem) return;

  const positions = rainSystem.geometry.attributes.position.array;

  for (let i = 1; i < positions.length; i += 3) {
    positions[i] -= deltaTime * 10;

    if (positions[i] < 0) {
      positions[i] = Math.random() * 50;
    }
  }

  rainSystem.geometry.attributes.position.needsUpdate = true;
}
