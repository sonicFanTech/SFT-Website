import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

RectAreaLightUniformsLib.init();

const DEFAULT_LIGHTING = {
  background: 0x020405,
  fogColor: 0x050b0d,
  fogNear: 16,
  fogFar: 80,
  hemisphereSky: 0x8eafb6,
  hemisphereGround: 0x050708,
  hemisphereIntensity: 0.075,
  ambientColor: 0x718c91,
  ambientIntensity: 0.024,
  fixtureColor: 0xbde5ef,
  warmFixtureColor: 0xffa14f,
  fixtureIntensity: 2.45,
  fixturePointIntensity: 1.25,
  fixturePointDistance: 7.0,
  fixturePointDecay: 1.78,
  fixtureRectStride: 1,
  fixturePointStride: 2,
  maxFixturePoints: 6,
  emissiveBoost: 0.94,
  exposure: 0.76,
  bloomStrength: 0.25,
  bloomRadius: 0.43,
  bloomThreshold: 0.88,
  aoRadius: 6,
  aoMinDistance: 0.002,
  aoMaxDistance: 0.11,
  envMapIntensity: 0.22,
  flashlightColor: 0xd7f7f2,
  flashlightIntensity: 10.5,
  flashlightDistance: 23,
  flashlightAngle: Math.PI / 6.4,
  flashlightPenumbra: 0.64,
};

const zones = [
  {
    id: '01', slug: '01_baseline_elevator_bank', title: 'Baseline Elevator Bank',
    description: 'Early-2000s baseline garage with a public-use elevator bank.',
    model: 'assets/models/01_baseline_elevator_bank.glb', preview: 'assets/renders/01_baseline_elevator_bank.png',
    spawn: [8.6, 0, 4.8], yaw: 0,
    lighting: { exposure: 0.78, fogFar: 90, ambientIntensity: 0.030, hemisphereIntensity: 0.085, fixtureIntensity: 2.75, fixturePointIntensity: 1.35, bloomStrength: 0.28 }
  },
  {
    id: '02', slug: '02_repeating_aisle', title: 'Repeating Aisle',
    description: 'Vehicle-free repeating aisle with unreliable repeated B3 labels.',
    model: 'assets/models/02_repeating_aisle.glb', preview: 'assets/renders/02_repeating_aisle.png',
    spawn: [0, 0, 27], yaw: 0,
    lighting: { background: 0x010304, fogNear: 15, fogFar: 75, ambientIntensity: 0.014, hemisphereIntensity: 0.046, fixtureIntensity: 2.35, fixturePointIntensity: 1.0, exposure: 0.69, bloomStrength: 0.28 }
  },
  {
    id: '03', slug: '03_passenger_cab_void', title: 'Passenger Cab Void',
    description: 'Passenger elevator opening through its rear into another garage section.',
    model: 'assets/models/03_passenger_cab_void.glb', preview: 'assets/renders/03_passenger_cab_void.png',
    spawn: [0.3, 0, 7.8], yaw: 0,
    lighting: { ambientIntensity: 0.032, hemisphereIntensity: 0.09, fixtureIntensity: 2.85, fixturePointIntensity: 1.45, exposure: 0.81, bloomStrength: 0.31 }
  },
  {
    id: '04', slug: '04_old_service_elevator', title: 'Old Service Elevator',
    description: 'Older warm-lit layer with a worn service elevator gate.',
    model: 'assets/models/04_old_service_elevator.glb', preview: 'assets/renders/04_old_service_elevator.png',
    spawn: [0, 0, -2.6], yaw: 0,
    lighting: { background: 0x080301, fogColor: 0x100602, fogNear: 17, fogFar: 76, hemisphereSky: 0xc47735, hemisphereGround: 0x0b0301, hemisphereIntensity: 0.060, ambientColor: 0xa35c27, ambientIntensity: 0.022, fixtureColor: 0xff9b42, warmFixtureColor: 0xff8d37, fixtureIntensity: 2.55, fixturePointIntensity: 1.20, exposure: 0.70, bloomStrength: 0.27, envMapIntensity: 0.18, flashlightColor: 0xffd2a4 }
  },
  {
    id: '05', slug: '05_modern_neglected_security', title: 'Modern Neglected Security',
    description: 'Modern neglected layer with an inactive booth and access gate.',
    model: 'assets/models/05_modern_neglected_security.glb', preview: 'assets/renders/05_modern_neglected_security.png',
    spawn: [-10.8, 0, 11.8], yaw: -0.47,
    lighting: { background: 0x010405, fogFar: 77, ambientIntensity: 0.012, hemisphereIntensity: 0.042, fixtureIntensity: 2.15, fixturePointIntensity: 0.88, exposure: 0.67, bloomStrength: 0.23 }
  },
  {
    id: '06', slug: '06_hydraulic_maintenance_region', title: 'Hydraulic Maintenance Region',
    description: 'Maintenance region with panels, pump, oil tank, and a low-rise elevator.',
    model: 'assets/models/06_hydraulic_maintenance_region.glb', preview: 'assets/renders/06_hydraulic_maintenance_region.png',
    spawn: [-10.8, 0, -8.2], yaw: -0.88,
    lighting: { background: 0x000102, fogColor: 0x020303, fogNear: 10, fogFar: 53, hemisphereSky: 0x3d4d52, hemisphereGround: 0x010101, hemisphereIntensity: 0.011, ambientColor: 0x475050, ambientIntensity: 0.0035, fixtureIntensity: 1.10, fixturePointIntensity: 0.34, fixtureRectStride: 2, fixturePointStride: 99, maxFixturePoints: 0, emissiveBoost: 0.78, exposure: 0.56, bloomStrength: 0.28, bloomRadius: 0.48, bloomThreshold: 0.86, envMapIntensity: 0.08, flashlightIntensity: 8.5 }
  },
  {
    id: '07', slug: '07_flooded_leaking_floor', title: 'Flooded Leaking Floor',
    description: 'Damp replacement floor with leaks and standing water.',
    model: 'assets/models/07_flooded_leaking_floor.glb', preview: 'assets/renders/07_flooded_leaking_floor.png',
    spawn: [-9.7, 0, 15], yaw: -0.42,
    lighting: { background: 0x010405, fogColor: 0x050f12, fogNear: 14, fogFar: 80, ambientIntensity: 0.019, hemisphereIntensity: 0.060, fixtureIntensity: 2.40, fixturePointIntensity: 1.05, exposure: 0.73, bloomStrength: 0.29, envMapIntensity: 0.38 }
  },
  {
    id: '08', slug: '08_zone_blackout', title: 'Zone Blackout',
    description: 'Moving blackout sequence ending at an emergency-lit landing.',
    model: 'assets/models/08_zone_blackout.glb', preview: 'assets/renders/08_zone_blackout.png',
    spawn: [0, 0, 17.5], yaw: 0,
    lighting: { background: 0x000102, fogColor: 0x070102, fogNear: 9, fogFar: 59, hemisphereSky: 0x27373c, hemisphereGround: 0x020000, hemisphereIntensity: 0.015, ambientColor: 0x493533, ambientIntensity: 0.005, fixtureIntensity: 2.00, fixturePointIntensity: 0.72, fixturePointStride: 3, maxFixturePoints: 2, emissiveBoost: 0.88, exposure: 0.65, bloomStrength: 0.45, bloomRadius: 0.58, bloomThreshold: 0.70, envMapIntensity: 0.10, flashlightIntensity: 9.5 }
  },
  {
    id: '09', slug: '09_exposed_shaft_and_pit', title: 'Exposed Shaft and Pit',
    description: 'Explorable shaft and pit with rails, buffers, ladder, and piping.',
    preview: 'assets/renders/09_exposed_shaft_and_pit.png'
  },
  {
    id: '10', slug: '10_misleveled_elevator_car', title: 'Misleveled Elevator Car',
    description: 'Passenger car stopped above landing level.',
    model: 'assets/models/10_misleveled_elevator_car.glb', preview: 'assets/renders/10_misleveled_elevator_car.png',
    spawn: [0, 0, 6.8], yaw: 0,
    lighting: { ambientIntensity: 0.032, hemisphereIntensity: 0.09, fixtureIntensity: 2.80, fixturePointIntensity: 1.40, exposure: 0.80, bloomStrength: 0.29 }
  },
  {
    id: '11', slug: '11_false_exit_loop', title: 'False Exit Loop',
    description: 'Convincing EXIT opening that loops back into another garage aisle.',
    model: 'assets/models/11_false_exit_loop.glb', preview: 'assets/renders/11_false_exit_loop.png',
    spawn: [0, 0, 11], yaw: 0,
    lighting: { background: 0x010405, fogNear: 15, fogFar: 82, ambientIntensity: 0.030, hemisphereIntensity: 0.082, fixtureIntensity: 2.75, fixturePointIntensity: 1.38, exposure: 0.82, bloomStrength: 0.29 }
  },
  {
    id: '12', slug: '12_outside_forest_route', title: 'Outside Forest Route',
    description: 'Exterior opening leading into a dark forest route.',
    model: 'assets/models/12_outside_forest_route.glb', preview: 'assets/renders/12_outside_forest_route.png',
    spawn: [0, 0, 10.8], yaw: 0,
    lighting: { background: 0x000201, fogColor: 0x020805, fogNear: 7, fogFar: 49, hemisphereSky: 0x254138, hemisphereGround: 0x000100, hemisphereIntensity: 0.012, ambientColor: 0x254038, ambientIntensity: 0.0035, fixtureIntensity: 0.92, fixturePointIntensity: 0.28, fixtureRectStride: 2, fixturePointStride: 99, maxFixturePoints: 0, emissiveBoost: 0.78, exposure: 0.55, bloomStrength: 0.24, envMapIntensity: 0.08, flashlightColor: 0xb9e9d9, flashlightIntensity: 8.5 }
  },
  {
    id: '13', slug: '13_discolored_wall_exit', title: 'Discolored Wall Exit',
    description: 'Strangely discolored wall used as an anomalous noclip exit.',
    model: 'assets/models/13_discolored_wall_exit.glb', preview: 'assets/renders/13_discolored_wall_exit.png',
    spawn: [-1.8, 0, 9.8], yaw: -0.73,
    lighting: { background: 0x010403, fogColor: 0x050e0a, fogNear: 14, fogFar: 73, hemisphereSky: 0x627e77, hemisphereGround: 0x010302, hemisphereIntensity: 0.050, ambientColor: 0x607770, ambientIntensity: 0.015, fixtureIntensity: 2.25, fixturePointIntensity: 0.92, exposure: 0.70, bloomStrength: 0.26, envMapIntensity: 0.18 }
  },
  {
    id: '14', slug: '14_outside_forest_clearing', title: 'Outside Forest Clearing',
    description: 'Exterior service road and rain-darkened forest clearing.',
    preview: 'assets/renders/14_outside_forest_clearing.png'
  },
  {
    id: '15', slug: '15_open_air_upper_deck', title: 'Open-Air Upper Deck',
    description: 'Open-air parking deck configuration with a ramp opening and forest edge.',
    preview: 'assets/renders/15_open_air_upper_deck.png'
  },
  {
    id: '16', slug: '16_traction_machine_room', title: 'Traction Machine Room',
    description: 'Machine room with controllers, motor, sheave, and hoist ropes.',
    preview: 'assets/renders/16_traction_machine_room.png'
  },
  {
    id: '17', slug: '17_hydraulic_machine_room', title: 'Hydraulic Machine Room',
    description: 'Low-rise equipment room with reservoir, pump, controller, and piping.',
    preview: 'assets/renders/17_hydraulic_machine_room.png'
  },
  {
    id: '18', slug: '18_shaft_top_down', title: 'Shaft Top-Down',
    description: 'Top-down elevator shaft view with a car roof, guide rails, ropes, and counterweight.',
    preview: 'assets/renders/18_shaft_top_down.png'
  },
  {
    id: '19', slug: '19_top_of_car_access', title: 'Top-of-Car Access',
    description: 'Top-of-car service access area and inspection station.',
    preview: 'assets/renders/19_top_of_car_access.png'
  },
  {
    id: '20', slug: '20_looping_stairwell', title: 'Looping Stairwell',
    description: 'Stairwell configuration with repeated B2 labels and an unreliable return path.',
    model: 'assets/models/20_looping_stairwell.glb', preview: 'assets/renders/20_looping_stairwell.png',
    spawn: [4.15, 0, 4.8], yaw: 0.63,
    lighting: { background: 0x010304, fogColor: 0x050b0e, fogNear: 7, fogFar: 43, hemisphereSky: 0x607b83, hemisphereGround: 0x010203, hemisphereIntensity: 0.025, ambientColor: 0x596b70, ambientIntensity: 0.008, exposure: 0.62, bloomStrength: 0.22, envMapIntensity: 0.11, flashlightIntensity: 9.0 }
  },
  {
    id: '21', slug: '21_unfinished_elevator_installation', title: 'Unfinished Elevator Installation',
    description: 'Damaged unfinished landing with exposed rails, loose panels, and components.',
    model: 'assets/models/21_unfinished_elevator_installation.glb', preview: 'assets/renders/21_unfinished_elevator_installation.png',
    spawn: [0, 0, 7], yaw: 0,
    lighting: { background: 0x040100, fogColor: 0x090402, fogNear: 9, fogFar: 56, hemisphereSky: 0x704320, hemisphereGround: 0x020100, hemisphereIntensity: 0.012, ambientColor: 0x694321, ambientIntensity: 0.004, fixtureIntensity: 0.95, fixturePointIntensity: 0.30, fixtureRectStride: 2, fixturePointStride: 99, maxFixturePoints: 0, emissiveBoost: 0.80, exposure: 0.56, bloomStrength: 0.31, envMapIntensity: 0.09, flashlightColor: 0xffd0aa, flashlightIntensity: 8.8 }
  },
  {
    id: '22', slug: '22_mixed_era_ramp', title: 'Mixed-Era Ramp',
    description: 'Parking ramp crossing between cold early-2000s and older amber-lit structural layers.',
    preview: 'assets/renders/22_mixed_era_ramp.png'
  }
];

const QUALITY_PRESETS = {
  LOW: {
    label: 'LOW', pixelRatio: 1.0, bloom: false, ao: false, shadows: false,
    fixtureStride: 2, pointStride: 3, lightScale: 0.82, pointScale: 0.56,
    description: 'Fastest mode. Local fixture lighting remains active, while bloom, ambient occlusion, and dynamic shadows are disabled.'
  },
  MEDIUM: {
    label: 'MEDIUM', pixelRatio: 1.25, bloom: true, ao: false, shadows: false,
    fixtureStride: 1, pointStride: 2, lightScale: 0.92, pointScale: 0.68,
    description: 'Balanced mode. Adds fluorescent bloom and more local fixture lighting without the heavier shadow and ambient-occlusion passes.'
  },
  HIGH: {
    label: 'HIGH', pixelRatio: 1.5, bloom: true, ao: true, shadows: true,
    fixtureStride: 1, pointStride: 1, lightScale: 1.0, pointScale: 0.78,
    description: 'Recommended mode. Adds bloom, contact-shadow ambient occlusion, reflective environment lighting, and a shadow-casting visibility light.'
  },
  ULTRA: {
    label: 'ULTRA', pixelRatio: 1.85, bloom: true, ao: true, shadows: true,
    fixtureStride: 1, pointStride: 1, lightScale: 1.0, pointScale: 0.82,
    description: 'Highest real-time WebGL quality. Uses a higher render resolution while preserving the render-matched scene brightness. Lower this setting if frame rate drops.'
  }
};

const availableZones = zones.filter((zone) => zone.model);
const elements = {
  canvas: document.querySelector('#viewport'),
  zoneTitle: document.querySelector('#zone-title'),
  zoneDescription: document.querySelector('#zone-description'),
  zoneCounter: document.querySelector('#zone-counter'),
  collisionState: document.querySelector('#collision-state'),
  flashlightState: document.querySelector('#flashlight-state'),
  graphicsState: document.querySelector('#graphics-state'),
  lightingState: document.querySelector('#lighting-state'),
  loadingScreen: document.querySelector('#loading-screen'),
  loadingTitle: document.querySelector('#loading-title'),
  loadingMessage: document.querySelector('#loading-message'),
  progressBar: document.querySelector('#progress-bar'),
  entryScreen: document.querySelector('#entry-screen'),
  pauseScreen: document.querySelector('#pause-screen'),
  zonesScreen: document.querySelector('#zones-screen'),
  graphicsScreen: document.querySelector('#graphics-screen'),
  zonesGrid: document.querySelector('#zones-grid'),
  enterButton: document.querySelector('#enter-button'),
  openZonesButton: document.querySelector('#open-zones-button'),
  entryGraphicsButton: document.querySelector('#entry-graphics-button'),
  resumeButton: document.querySelector('#resume-button'),
  respawnButton: document.querySelector('#respawn-button'),
  pauseZonesButton: document.querySelector('#pause-zones-button'),
  pauseGraphicsButton: document.querySelector('#pause-graphics-button'),
  closeZonesButton: document.querySelector('#close-zones-button'),
  closeGraphicsButton: document.querySelector('#close-graphics-button'),
  qualityButtons: [...document.querySelectorAll('[data-quality]')],
  graphicsDescription: document.querySelector('#graphics-description'),
  graphicsDetails: document.querySelector('#graphics-details'),
  brightnessSlider: document.querySelector('#scene-brightness'),
  brightnessValue: document.querySelector('#brightness-value'),
  resetBrightnessButton: document.querySelector('#reset-brightness-button')
};

let qualityName = localStorage.getItem('level222.graphicsQuality') || 'HIGH';
if (!QUALITY_PRESETS[qualityName]) qualityName = 'HIGH';
let quality = QUALITY_PRESETS[qualityName];
let brightnessPercent = Number.parseInt(localStorage.getItem('level222.sceneBrightness') || '100', 10);
if (!Number.isFinite(brightnessPercent)) brightnessPercent = 100;
brightnessPercent = Math.max(65, Math.min(125, brightnessPercent));
let brightnessScale = brightnessPercent / 100;

const renderer = new THREE.WebGLRenderer({ canvas: elements.canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(DEFAULT_LIGHTING.background);
scene.fog = new THREE.Fog(DEFAULT_LIGHTING.fogColor, DEFAULT_LIGHTING.fogNear, DEFAULT_LIGHTING.fogFar);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.08, 260);
camera.rotation.order = 'YXZ';
scene.add(camera);

const controls = new PointerLockControls(camera, document.body);
const hemisphere = new THREE.HemisphereLight(DEFAULT_LIGHTING.hemisphereSky, DEFAULT_LIGHTING.hemisphereGround, DEFAULT_LIGHTING.hemisphereIntensity);
const ambient = new THREE.AmbientLight(DEFAULT_LIGHTING.ambientColor, DEFAULT_LIGHTING.ambientIntensity);
scene.add(hemisphere, ambient);

const visibilityLight = new THREE.SpotLight(
  DEFAULT_LIGHTING.flashlightColor,
  DEFAULT_LIGHTING.flashlightIntensity,
  DEFAULT_LIGHTING.flashlightDistance,
  DEFAULT_LIGHTING.flashlightAngle,
  DEFAULT_LIGHTING.flashlightPenumbra,
  1.36
);
visibilityLight.position.set(0, 0.06, 0);
visibilityLight.target.position.set(0, -0.08, -1);
visibilityLight.shadow.mapSize.set(1024, 1024);
visibilityLight.shadow.camera.near = 0.25;
visibilityLight.shadow.camera.far = 34;
visibilityLight.shadow.bias = -0.00038;
visibilityLight.shadow.normalBias = 0.022;
camera.add(visibilityLight, visibilityLight.target);
visibilityLight.visible = false;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const roomEnvironment = new RoomEnvironment();
const environmentMap = pmremGenerator.fromScene(roomEnvironment, 0.035).texture;
roomEnvironment.dispose?.();
pmremGenerator.dispose();
scene.environment = environmentMap;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.42, 0.52, 0.72);
const outputPass = new OutputPass();
composer.addPass(renderPass);
composer.addPass(ssaoPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);

const loader = new GLTFLoader();
let worldOctree = new Octree();
let loadedModel = null;
let activeZone = null;
let activeBounds = null;
let zoneLightGroup = new THREE.Group();
let animatedLights = [];
let loadingToken = 0;
let firstLoad = true;
let flashlightEnabled = false;
let hasEntered = false;
let selectorReturnScreen = 'entry';
let graphicsReturnScreen = 'entry';

scene.add(zoneLightGroup);

const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1.55, 0), 0.35);
const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();
let playerOnFloor = false;
const keyStates = Object.create(null);
const clock = new THREE.Clock();

function lightingFor(zone) {
  return { ...DEFAULT_LIGHTING, ...(zone?.lighting || {}) };
}

function fromBlender(x, y, z) {
  return new THREE.Vector3(x, z, -y);
}

function showOnly(screen) {
  [elements.loadingScreen, elements.entryScreen, elements.pauseScreen, elements.zonesScreen, elements.graphicsScreen]
    .forEach((item) => item.classList.remove('visible'));
  if (screen) screen.classList.add('visible');
}

function setLoading(title, message, percent = 0) {
  elements.loadingTitle.textContent = title;
  elements.loadingMessage.textContent = message;
  elements.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  showOnly(elements.loadingScreen);
}

function updateHud() {
  if (!activeZone) return;
  elements.zoneTitle.textContent = `${activeZone.id} // ${activeZone.title.toUpperCase()}`;
  elements.zoneDescription.textContent = activeZone.description;
  elements.zoneCounter.textContent = `AREA ${activeZone.id} / 22`;
  elements.collisionState.textContent = loadedModel ? 'COLLISION: ACTIVE' : 'COLLISION: STANDBY';
  elements.flashlightState.textContent = `VISIBILITY LIGHT: ${flashlightEnabled ? 'ON' : 'OFF'}`;
  elements.graphicsState.textContent = `GRAPHICS: ${quality.label} // BRIGHTNESS: ${brightnessPercent}%`;
  elements.lightingState.textContent = `LOCAL LIGHTS: ${zoneLightGroup.children.length}`;
}

function disposeMaterial(material) {
  if (!material) return;
  Object.values(material).forEach((value) => {
    if (value && value.isTexture) value.dispose();
  });
  material.dispose?.();
}

function clearZoneLights() {
  scene.remove(zoneLightGroup);
  zoneLightGroup.clear();
  zoneLightGroup = new THREE.Group();
  zoneLightGroup.name = 'Area-specific WebGL lighting';
  scene.add(zoneLightGroup);
  animatedLights = [];
}

function disposeLoadedModel() {
  clearZoneLights();
  if (!loadedModel) return;
  scene.remove(loadedModel);
  loadedModel.traverse((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) child.material.forEach(disposeMaterial);
    else disposeMaterial(child.material);
  });
  loadedModel = null;
  activeBounds = null;
  worldOctree = new Octree();
}

function prepareMaterial(material, profile) {
  if (!material) return;
  if (!material.userData.level222Base) {
    material.userData.level222Base = {
      emissiveIntensity: Number.isFinite(material.emissiveIntensity) ? material.emissiveIntensity : 1,
      envMapIntensity: Number.isFinite(material.envMapIntensity) ? material.envMapIntensity : 1,
      roughness: Number.isFinite(material.roughness) ? material.roughness : null,
      metalness: Number.isFinite(material.metalness) ? material.metalness : null
    };
  }
  const base = material.userData.level222Base;
  const name = String(material.name || '').toLowerCase();
  if (material.emissive && material.emissive.getHex() !== 0) {
    material.emissiveIntensity = base.emissiveIntensity * profile.emissiveBoost;
  }
  if ('envMapIntensity' in material) {
    let multiplier = profile.envMapIntensity;
    if (name.includes('steel') || name.includes('stainless') || name.includes('metal')) multiplier *= 1.35;
    if (name.includes('standing water')) multiplier *= 2.2;
    material.envMapIntensity = base.envMapIntensity * multiplier;
  }
  if (name.includes('standing water')) {
    if ('roughness' in material) material.roughness = 0.075;
    if ('metalness' in material) material.metalness = 0.0;
  }
  material.needsUpdate = true;
}

function configureImportedMeshes(profile) {
  if (!loadedModel) return;
  loadedModel.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = quality.shadows;
    child.receiveShadow = quality.shadows;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => prepareMaterial(material, profile));
  });
}

function addAnimatedLight(light, { amplitude = 0.0, speed = 5.0, phase = Math.random() * Math.PI * 2, irregular = false } = {}) {
  if (amplitude > 0) animatedLights.push({ light, baseIntensity: light.intensity, amplitude, speed, phase, irregular });
  return light;
}

function addPoint({ position, color, intensity, distance = 12, decay = 1.45, flicker = 0, flickerSpeed = 5, irregular = false }) {
  const light = new THREE.PointLight(color, intensity * quality.pointScale, distance, decay);
  light.position.copy(position);
  zoneLightGroup.add(light);
  return addAnimatedLight(light, { amplitude: flicker, speed: flickerSpeed, irregular });
}

function addSpot({ position, target, color, intensity, distance = 24, angle = Math.PI / 4, penumbra = 0.62, decay = 1.35, flicker = 0, flickerSpeed = 5, irregular = false }) {
  const light = new THREE.SpotLight(color, intensity * quality.pointScale, distance, angle, penumbra, decay);
  light.position.copy(position);
  light.target.position.copy(target);
  zoneLightGroup.add(light, light.target);
  return addAnimatedLight(light, { amplitude: flicker, speed: flickerSpeed, irregular });
}

function addRect({ position, target, color, intensity, width = 3.5, height = 0.3, flicker = 0, flickerSpeed = 5, irregular = false }) {
  const light = new THREE.RectAreaLight(color, intensity * quality.lightScale, width, height);
  light.position.copy(position);
  light.lookAt(target);
  zoneLightGroup.add(light);
  return addAnimatedLight(light, { amplitude: flicker, speed: flickerSpeed, irregular });
}

function materialName(mesh) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.map((material) => String(material?.name || '')).join(' ').toLowerCase();
}

function fixtureColor(mesh, profile) {
  const source = `${mesh.name} ${materialName(mesh)}`.toLowerCase();
  if (source.includes('emergency')) return 0xff1205;
  if (source.includes('warm') || source.includes('maintenance work light')) return profile.warmFixtureColor;
  return profile.fixtureColor;
}

function buildFixtureLights(profile) {
  if (!loadedModel) return;
  loadedModel.updateMatrixWorld(true);
  const fixtures = [];
  loadedModel.traverse((child) => {
    if (!child.isMesh) return;
    const name = String(child.name || '').toLowerCase();
    if (name.includes('fluorescent diffuser') || name.includes('cab ceiling light') || name.includes('maintenance work light')) fixtures.push(child);
  });
  fixtures.sort((a, b) => a.name.localeCompare(b.name));

  const rectStride = Math.max(1, Math.round(quality.fixtureStride * profile.fixtureRectStride));
  const pointStride = Math.max(1, Math.round(quality.pointStride * profile.fixturePointStride));
  let pointCount = 0;

  fixtures.forEach((fixture, index) => {
    if (index % rectStride !== 0) return;
    const position = fixture.getWorldPosition(new THREE.Vector3());
    const size = new THREE.Box3().setFromObject(fixture).getSize(new THREE.Vector3());
    const color = fixtureColor(fixture, profile);
    const fixtureName = fixture.name.toLowerCase();
    const isCab = fixtureName.includes('cab ceiling');
    const isMaintenance = fixtureName.includes('maintenance work light');
    const rectIntensity = profile.fixtureIntensity * (isCab ? 1.08 : isMaintenance ? 1.18 : 1.0);
    const pointIntensity = profile.fixturePointIntensity * (isCab ? 1.04 : isMaintenance ? 1.18 : 1.0);
    const flicker = activeZone?.id === '08' ? 0.032 : isMaintenance ? 0.022 : 0.008;

    addRect({
      position: position.clone().add(new THREE.Vector3(0, -0.07, 0)),
      target: position.clone().add(new THREE.Vector3(0, -2.2, 0)),
      color,
      intensity: rectIntensity,
      width: Math.max(1.1, size.x * 0.98),
      height: Math.max(0.18, size.z * 1.12),
      flicker,
      flickerSpeed: isMaintenance ? 8.2 : 4.7
    });

    if (index % pointStride === 0 && pointCount < profile.maxFixturePoints) {
      addPoint({
        position: position.clone().add(new THREE.Vector3(0, -0.26, 0)),
        color,
        intensity: pointIntensity,
        distance: profile.fixturePointDistance,
        decay: profile.fixturePointDecay,
        flicker,
        flickerSpeed: isMaintenance ? 8.2 : 4.7
      });
      pointCount += 1;
    }
  });
}

function addSpecialZoneLights(zone, profile) {
  switch (zone.id) {
    case '06':
      addSpot({ position: fromBlender(-1.5, 10.2, 2.82), target: fromBlender(1.5, 18.2, 0.8), color: 0x6f9fb7, intensity: 6.4, distance: 20, angle: Math.PI / 4.6, penumbra: 0.82 });
      addPoint({ position: fromBlender(6.6, 17.6, 2.42), color: 0xff8629, intensity: 4.4, distance: 8.5, decay: 1.62, flicker: 0.045, flickerSpeed: 8.5 });
      break;
    case '07':
      addPoint({ position: fromBlender(1.0, 8.0, 0.42), color: 0x51a4bf, intensity: 3.0, distance: 10.5, decay: 1.55 });
      break;
    case '08':
      addPoint({ position: fromBlender(0, 19.26, 2.85), color: 0xff1005, intensity: 9.0, distance: 12, decay: 1.52, flicker: 0.13, flickerSpeed: 11, irregular: true });
      addSpot({ position: fromBlender(0, 18.7, 2.75), target: fromBlender(0, 11.0, 0.45), color: 0xff1608, intensity: 5.7, distance: 18, angle: Math.PI / 6.0, penumbra: 0.82, decay: 1.55, flicker: 0.10, flickerSpeed: 10, irregular: true });
      break;
    case '11':
      addSpot({ position: fromBlender(0, 16.2, 2.75), target: fromBlender(0, 20.0, 1.0), color: 0x9fcfe0, intensity: 5.2, distance: 13, angle: Math.PI / 4.2, penumbra: 0.76, decay: 1.55 });
      break;
    case '12':
      addPoint({ position: fromBlender(0, 17.0, 1.8), color: 0x28745d, intensity: 7.0, distance: 25, decay: 1.52 });
      addSpot({ position: fromBlender(0, 16.0, 5.5), target: fromBlender(0, 20.0, 1.6), color: 0x387d68, intensity: 8.5, distance: 28, angle: Math.PI / 3.8, penumbra: 0.86, decay: 1.48 });
      addSpot({ position: fromBlender(0, 13.6, 2.7), target: fromBlender(0, 20.0, 2.1), color: 0x25634f, intensity: 4.4, distance: 22, angle: Math.PI / 4.0, penumbra: 0.84, decay: 1.55 });
      break;
    case '13':
      addPoint({ position: fromBlender(10.8, 5.4, 1.4), color: 0x3b895d, intensity: 2.7, distance: 7.0, decay: 1.62, flicker: 0.025, flickerSpeed: 3.7 });
      break;
    case '20':
      addRect({ position: fromBlender(0, 0, 5.9), target: fromBlender(0, 0.5, 2.2), color: 0x94cde2, intensity: 4.0, width: 4.5, height: 1.2 });
      addPoint({ position: fromBlender(0, 0.4, 5.45), color: 0x86bfd5, intensity: 3.5, distance: 11, decay: 1.65 });
      break;
    case '21':
      addRect({ position: fromBlender(0, 11.85, 2.88), target: fromBlender(0, 13.85, 1.1), color: 0xff8d38, intensity: 3.3, width: 3.6, height: 0.7, flicker: 0.055, flickerSpeed: 7.5 });
      addPoint({ position: fromBlender(0, 12.2, 2.45), color: 0xff812d, intensity: 3.7, distance: 10, decay: 1.62, flicker: 0.065, flickerSpeed: 7.5 });
      break;
    default:
      break;
  }
}

function rebuildZoneLights() {
  clearZoneLights();
  if (!loadedModel || !activeZone) return;
  const profile = lightingFor(activeZone);
  buildFixtureLights(profile);
  addSpecialZoneLights(activeZone, profile);
  updateHud();
}

function applyZoneLighting(zone, { rebuild = true } = {}) {
  const profile = lightingFor(zone);
  scene.background.setHex(profile.background);
  scene.fog.color.setHex(profile.fogColor);
  scene.fog.near = profile.fogNear;
  scene.fog.far = profile.fogFar;
  hemisphere.color.setHex(profile.hemisphereSky);
  hemisphere.groundColor.setHex(profile.hemisphereGround);
  hemisphere.intensity = profile.hemisphereIntensity;
  ambient.color.setHex(profile.ambientColor);
  ambient.intensity = profile.ambientIntensity;
  renderer.toneMappingExposure = profile.exposure * brightnessScale;
  bloomPass.strength = profile.bloomStrength;
  bloomPass.radius = profile.bloomRadius;
  bloomPass.threshold = profile.bloomThreshold;
  ssaoPass.kernelRadius = profile.aoRadius;
  ssaoPass.minDistance = profile.aoMinDistance;
  ssaoPass.maxDistance = profile.aoMaxDistance;
  visibilityLight.color.setHex(profile.flashlightColor);
  visibilityLight.intensity = profile.flashlightIntensity;
  visibilityLight.distance = profile.flashlightDistance;
  visibilityLight.angle = profile.flashlightAngle;
  visibilityLight.penumbra = profile.flashlightPenumbra;
  visibilityLight.shadow.camera.far = Math.max(8, profile.flashlightDistance + 3);
  visibilityLight.shadow.camera.updateProjectionMatrix();
  if (loadedModel) configureImportedMeshes(profile);
  if (rebuild) rebuildZoneLights();
}


function applySceneBrightness(value, { save = true } = {}) {
  const parsed = Number.parseInt(String(value), 10);
  brightnessPercent = Number.isFinite(parsed) ? Math.max(65, Math.min(125, parsed)) : 100;
  brightnessScale = brightnessPercent / 100;
  if (save) localStorage.setItem('level222.sceneBrightness', String(brightnessPercent));
  if (elements.brightnessSlider) elements.brightnessSlider.value = String(brightnessPercent);
  if (elements.brightnessValue) elements.brightnessValue.textContent = `${brightnessPercent}%`;
  if (activeZone) renderer.toneMappingExposure = lightingFor(activeZone).exposure * brightnessScale;
  updateHud();
}

function applyGraphicsQuality(name, { rebuild = true } = {}) {
  if (!QUALITY_PRESETS[name]) return;
  qualityName = name;
  quality = QUALITY_PRESETS[name];
  localStorage.setItem('level222.graphicsQuality', qualityName);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = quality.shadows;
  visibilityLight.castShadow = quality.shadows;
  ssaoPass.enabled = quality.ao;
  bloomPass.enabled = quality.bloom;
  composer.setPixelRatio(pixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);
  elements.qualityButtons.forEach((button) => button.classList.toggle('selected', button.dataset.quality === qualityName));
  elements.graphicsDescription.textContent = quality.description;
  elements.graphicsDetails.textContent = [
    `BLOOM ${quality.bloom ? 'ON' : 'OFF'}`,
    `AMBIENT OCCLUSION ${quality.ao ? 'ON' : 'OFF'}`,
    `FLASHLIGHT SHADOWS ${quality.shadows ? 'ON' : 'OFF'}`,
    `SCENE BRIGHTNESS ${brightnessPercent}%`,
    `PIXEL RATIO CAP ${quality.pixelRatio.toFixed(2)}x`
  ].join('  //  ');
  if (loadedModel && activeZone) {
    configureImportedMeshes(lightingFor(activeZone));
    if (rebuild) rebuildZoneLights();
  }
  updateHud();
}

function respawn() {
  if (!activeZone?.spawn) return;
  const [x, y, z] = activeZone.spawn;
  playerCollider.start.set(x, y + 0.35, z);
  playerCollider.end.set(x, y + 1.55, z);
  playerVelocity.set(0, 0, 0);
  camera.position.copy(playerCollider.end);
  camera.rotation.set(0, activeZone.yaw ?? 0, 0, 'YXZ');
}

function markActiveCard() {
  document.querySelectorAll('.zone-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.zone === activeZone?.id);
  });
}

function loadZone(zone) {
  if (!zone?.model) return;
  loadingToken += 1;
  const token = loadingToken;
  controls.unlock();
  setLoading(`LOADING AREA ${zone.id}`, `${zone.title} // Preparing render-inspired WebGL lighting`, 4);
  disposeLoadedModel();
  activeZone = zone;
  applyZoneLighting(zone, { rebuild: false });
  updateHud();
  markActiveCard();

  loader.load(
    zone.model,
    (gltf) => {
      if (token !== loadingToken) return;
      loadedModel = gltf.scene;
      loadedModel.name = `Level 2.22 Area ${zone.id}`;
      scene.add(loadedModel);
      activeBounds = new THREE.Box3().setFromObject(loadedModel);
      configureImportedMeshes(lightingFor(zone));
      worldOctree = new Octree();
      worldOctree.fromGraphNode(loadedModel);
      rebuildZoneLights();
      respawn();
      updateHud();
      elements.progressBar.style.width = '100%';
      const url = new URL(window.location.href);
      url.searchParams.set('zone', zone.id);
      history.replaceState({}, '', url);
      window.setTimeout(() => {
        showOnly(firstLoad ? elements.entryScreen : elements.pauseScreen);
        firstLoad = false;
      }, 180);
    },
    (event) => {
      if (token !== loadingToken) return;
      const percent = event.total ? (event.loaded / event.total) * 100 : Math.min(94, 12 + event.loaded / 350000);
      elements.progressBar.style.width = `${Math.max(4, Math.min(96, percent))}%`;
      elements.loadingMessage.textContent = event.total
        ? `${(event.loaded / 1048576).toFixed(1)} MB / ${(event.total / 1048576).toFixed(1)} MB`
        : `${(event.loaded / 1048576).toFixed(1)} MB received…`;
    },
    (error) => {
      console.error(error);
      elements.loadingTitle.textContent = 'MODEL LOAD FAILED';
      elements.loadingMessage.textContent = 'Run this project through the included local server or upload it to a website host. Opening index.html directly from File Explorer will not work.';
      elements.progressBar.style.width = '0%';
    }
  );
}

function buildZoneCards() {
  elements.zonesGrid.replaceChildren();
  for (const zone of zones) {
    const card = document.createElement('article');
    card.className = `zone-card${zone.model ? '' : ' unavailable'}`;
    card.dataset.zone = zone.id;
    const tag = zone.model ? 'EXPLORE' : 'RENDER ONLY';
    card.innerHTML = `
      <span class="zone-tag">${tag}</span>
      <img src="${zone.preview}" alt="Preview of ${zone.title}" loading="lazy">
      <div class="zone-card-body">
        <div class="zone-id">AREA ${zone.id}</div>
        <h3>${zone.title}</h3>
        <p>${zone.description}</p>
        <button ${zone.model ? '' : 'disabled'}>${zone.model ? 'LOAD AREA' : 'GLB NOT SUPPLIED'}</button>
      </div>
    `;
    if (zone.model) card.querySelector('button').addEventListener('click', () => loadZone(zone));
    elements.zonesGrid.append(card);
  }
}

function playerCollisions() {
  const result = worldOctree.capsuleIntersect(playerCollider);
  playerOnFloor = false;
  if (!result) return;
  playerOnFloor = result.normal.y > 0;
  if (!playerOnFloor) playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
  playerCollider.translate(result.normal.multiplyScalar(result.depth));
}

function getForwardVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  return playerDirection;
}

function getSideVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross(camera.up);
  return playerDirection;
}

function processInput(deltaTime) {
  if (!controls.isLocked) return;
  const speedDelta = deltaTime * (playerOnFloor ? 24 : 8);
  if (keyStates.KeyW) playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
  if (keyStates.KeyS) playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
  if (keyStates.KeyA) playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
  if (keyStates.KeyD) playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
  if (playerOnFloor && keyStates.Space) playerVelocity.y = 7.4;
}

function updatePlayer(deltaTime) {
  if (!loadedModel) return;
  let damping = Math.exp(-4 * deltaTime) - 1;
  if (!playerOnFloor) {
    playerVelocity.y -= 25 * deltaTime;
    damping *= 0.12;
  }
  playerVelocity.addScaledVector(playerVelocity, damping);
  playerCollider.translate(playerVelocity.clone().multiplyScalar(deltaTime));
  playerCollisions();
  camera.position.copy(playerCollider.end);
  if (activeBounds && camera.position.y < activeBounds.min.y - 12) respawn();
}

function updateAnimatedLights(elapsedTime) {
  for (const item of animatedLights) {
    let wave = Math.sin(elapsedTime * item.speed + item.phase);
    if (item.irregular) wave = wave * 0.56 + Math.sin(elapsedTime * item.speed * 2.73 + item.phase * 0.73) * 0.31 + Math.sin(elapsedTime * 17.7) * 0.13;
    item.light.intensity = item.baseIntensity * Math.max(0.22, 1 + wave * item.amplitude);
  }
}

function toggleVisibilityLight() {
  flashlightEnabled = !flashlightEnabled;
  visibilityLight.visible = flashlightEnabled;
  updateHud();
}

function openSelector(returnScreen) {
  selectorReturnScreen = returnScreen;
  controls.unlock();
  markActiveCard();
  showOnly(elements.zonesScreen);
}

function closeSelector() {
  if (selectorReturnScreen === 'pause' && hasEntered) showOnly(elements.pauseScreen);
  else showOnly(elements.entryScreen);
}

function openGraphics(returnScreen) {
  graphicsReturnScreen = returnScreen;
  controls.unlock();
  showOnly(elements.graphicsScreen);
}

function closeGraphics() {
  if (graphicsReturnScreen === 'pause' && hasEntered) showOnly(elements.pauseScreen);
  else showOnly(elements.entryScreen);
}

controls.addEventListener('lock', () => {
  hasEntered = true;
  document.body.classList.add('pointer-locked');
  showOnly(null);
});
controls.addEventListener('unlock', () => {
  document.body.classList.remove('pointer-locked');
  const overlayIsOpen = elements.zonesScreen.classList.contains('visible') || elements.graphicsScreen.classList.contains('visible') || elements.loadingScreen.classList.contains('visible');
  if (hasEntered && !overlayIsOpen) showOnly(elements.pauseScreen);
});

elements.enterButton.addEventListener('click', () => controls.lock());
elements.resumeButton.addEventListener('click', () => controls.lock());
elements.openZonesButton.addEventListener('click', () => openSelector('entry'));
elements.pauseZonesButton.addEventListener('click', () => openSelector('pause'));
elements.entryGraphicsButton.addEventListener('click', () => openGraphics('entry'));
elements.pauseGraphicsButton.addEventListener('click', () => openGraphics('pause'));
elements.closeZonesButton.addEventListener('click', closeSelector);
elements.closeGraphicsButton.addEventListener('click', closeGraphics);
elements.respawnButton.addEventListener('click', () => { respawn(); controls.lock(); });
elements.qualityButtons.forEach((button) => button.addEventListener('click', () => applyGraphicsQuality(button.dataset.quality)));
elements.brightnessSlider?.addEventListener('input', (event) => applySceneBrightness(event.target.value));
elements.resetBrightnessButton?.addEventListener('click', () => applySceneBrightness(100));

window.addEventListener('keydown', (event) => {
  keyStates[event.code] = true;
  if (event.code === 'KeyF' && !event.repeat) toggleVisibilityLight();
  if (event.code === 'KeyR' && !event.repeat) respawn();
  if (event.code === 'KeyG' && !event.repeat) openGraphics(hasEntered ? 'pause' : 'entry');
});
window.addEventListener('keyup', (event) => { keyStates[event.code] = false; });
window.addEventListener('blur', () => { Object.keys(keyStates).forEach((key) => { keyStates[key] = false; }); });
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  applyGraphicsQuality(qualityName, { rebuild: false });
});

function animate() {
  const frameDelta = Math.min(0.05, clock.getDelta());
  const elapsedTime = clock.elapsedTime;
  const steps = 4;
  const deltaTime = frameDelta / steps;
  for (let i = 0; i < steps; i += 1) {
    processInput(deltaTime);
    updatePlayer(deltaTime);
  }
  updateAnimatedLights(elapsedTime);
  composer.render();
  requestAnimationFrame(animate);
}

buildZoneCards();
applySceneBrightness(brightnessPercent, { save: false });
applyGraphicsQuality(qualityName, { rebuild: false });
const requested = new URLSearchParams(window.location.search).get('zone');
loadZone(availableZones.find((zone) => zone.id === requested) ?? availableZones[0]);
animate();
