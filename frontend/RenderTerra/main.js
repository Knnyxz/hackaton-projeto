import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//from https://cdn.jsdelivr.net/npm/satellite.js@6.0.1/dist/satellite.min.js
import * as satellite from './import/satellite-6.0.1';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let debrisModel = null;
let isModelLoaded = false;
let currentDebrisModel = null; // The currently displayed 3D model
const fbxLoader = new FBXLoader();
function loadDebrisModel() {
  console.log('Loading debris 3D model...');
  
  fbxLoader.load(
    './resources/models/destroco.fbx',
    (object) => {
      console.log('Debris model loaded successfully');
      
      // Store the loaded model
      debrisModel = object.clone();
      
      // Configure the model
      debrisModel.traverse((child) => {
        if (child.isMesh) {
          // Ensure proper materials
          if (child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }
      });
      
      // Scale the model appropriately (adjust as needed)
      debrisModel.scale.set(0.001, 0.001, 0.001);
      
      isModelLoaded = true;
      console.log('3D debris model ready for use');
    },
    (progress) => {
      console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
    },
    (error) => {
      console.error('Error loading debris model:', error);
      console.log('Will fallback to basic geometry for zoom views');
    }
  );
}
// Initialize model loading
loadDebrisModel();

// Constants
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_THREEJS = 1;
const KM_TO_THREEJS = EARTH_RADIUS_THREEJS / EARTH_RADIUS_KM;
const EARTH_AXIAL_TILT = 23.5 * Math.PI / 180;

// Performance settings
const PERFORMANCE_SETTINGS = {
  LOW_QUALITY: { segments: 4, detail: 4, maxDebris: 10000 },
  MEDIUM_QUALITY: { segments: 6, detail: 6, maxDebris: 25000 },
  HIGH_QUALITY: { segments: 8, detail: 8, maxDebris: 50000 },
  CURRENT_QUALITY: 'MEDIUM_QUALITY',
  CURRENT_COUNT: 10000,
  USE_INSTANCING: true,
  USE_LOD: true,
  FRUSTUM_CULLING: true
};


const scene = new THREE.Scene();

// Shaders customizados para fundo espacial realista
const spaceVertexShader = `
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const spaceFragmentShader = `
  uniform float time;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  void main() {
    vec3 direction = normalize(vWorldPosition - cameraPosition);
    
    float depth = length(vWorldPosition - cameraPosition) / 1000.0;
    vec3 deepSpace = mix(vec3(0.02, 0.02, 0.08), vec3(0.0, 0.0, 0.02), depth);
    
    vec3 nebulaPos = direction * 10.0 + vec3(time * 0.01);
    float nebula1 = fbm(nebulaPos * 0.5);
    float nebula2 = fbm(nebulaPos * 0.3 + vec3(100.0));
    
    vec3 nebulaColor1 = vec3(0.8, 0.2, 0.6) * nebula1 * 0.3;
    vec3 nebulaColor2 = vec3(0.2, 0.6, 0.9) * nebula2 * 0.2;
    
    float stars = noise(direction * 200.0);
    stars = pow(stars, 20.0) * 2.0;
    
    vec3 finalColor = deepSpace + nebulaColor1 + nebulaColor2 + vec3(stars);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function getCanvasSize() {
  // Get the actual container size (works in iframe)
  const container = document.body;
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

const canvasSize = getCanvasSize();
const camera = new THREE.PerspectiveCamera(75, canvasSize.width / canvasSize.height, 0.01, 1000);
const renderer = new THREE.WebGLRenderer({ 
  antialias: window.devicePixelRatio <= 1,
  powerPreference: "high-performance",
  logarithmicDepthBuffer: true
});
renderer.setSize(canvasSize.width, canvasSize.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.sortObjects = false;
renderer.info.autoReset = false;

document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
camera.position.set(5, 3, 5);

// Raycaster for mouse picking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Position the sun far away
const sunDistance = 500;
const sunPosition = new THREE.Vector3(sunDistance, sunDistance * 0.3, -sunDistance * 0.5);

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.copy(sunPosition);
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

// Earth with texture
const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS_THREEJS, 64, 64);
const textureLoader = new THREE.TextureLoader();

const earthTexture = textureLoader.load('./resources/textures/earth_2.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({ 
  map: earthTexture,
  shininess: 30,
  specular: 0x222222
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.rotation.z = -EARTH_AXIAL_TILT;
earth.rotation.y = Math.PI;
earth.castShadow = false;
earth.receiveShadow = false;
scene.add(earth);

// Enhanced atmosphere
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 sunDirection;
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    
    float fresnel = 1.0 - dot(normal, viewDirection);
    fresnel = pow(fresnel, 2.0);
    
    float sunDot = dot(normal, normalize(sunDirection));
    float sunIntensity = max(0.0, sunDot);
    
    vec3 dayColor = vec3(0.5, 0.8, 1.0);
    vec3 sunsetColor = vec3(1.0, 0.6, 0.3);
    vec3 nightColor = vec3(0.1, 0.2, 0.4);
    
    vec3 atmosphereColor = mix(nightColor, dayColor, sunIntensity);
    atmosphereColor = mix(atmosphereColor, sunsetColor, pow(max(0.0, sunDot * 0.5 + 0.5), 3.0));
    
    float opacity = fresnel * (0.3 + sunIntensity * 0.5);
    
    gl_FragColor = vec4(atmosphereColor, opacity);
  }
`;

const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS_THREEJS * 1.025, 32, 32);
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  uniforms: {
    sunDirection: { value: sunPosition.clone().normalize() },
    time: { value: 0.0 }
  },
  transparent: true,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

// Stars background
const starsGeometry = new THREE.BufferGeometry();
const starsPositions = new Float32Array(2000 * 3);
for (let i = 0; i < 2000 * 3; i += 3) {
  const radius = 100 + Math.random() * 900;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  
  starsPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
  starsPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starsPositions[i + 2] = radius * Math.cos(phi);
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Space sky background
const spaceSkyGeometry = new THREE.SphereGeometry(2000, 32, 32);
const spaceSkyMaterial = new THREE.ShaderMaterial({
  vertexShader: spaceVertexShader,
  fragmentShader: spaceFragmentShader,
  uniforms: {
    time: { value: 0.0 },
    cameraPosition: { value: camera.position }
  },
  side: THREE.BackSide,
  depthWrite: false
});
const spaceSky = new THREE.Mesh(spaceSkyGeometry, spaceSkyMaterial);
scene.add(spaceSky);

// Sun creation functions
function createSunTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.1, '#ffffaa');
  gradient.addColorStop(0.3, '#ffaa00');
  gradient.addColorStop(0.6, '#ff6600');
  gradient.addColorStop(0.8, '#cc3300');
  gradient.addColorStop(1.0, '#990000');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  return new THREE.CanvasTexture(canvas);
}

const sunTexture = createSunTexture();

// Sun shader
const sunVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunFragmentShader = `
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  
  void main() {
    vec3 normal = normalize(vNormal);
    
    vec3 plasmaPos = vPosition * 0.1 + vec3(time * 0.5);
    float plasma1 = noise(plasmaPos);
    float plasma2 = noise(plasmaPos * 2.0 + vec3(time * 0.3));
    
    vec3 coreColor = vec3(1.0, 1.0, 0.9);
    vec3 surfaceColor = vec3(1.0, 0.7, 0.2);
    vec3 flareColor = vec3(1.0, 0.3, 0.1);
    
    float intensity = plasma1 * 0.7 + plasma2 * 0.3;
    vec3 sunColor = mix(surfaceColor, coreColor, intensity);
    sunColor = mix(sunColor, flareColor, pow(intensity, 3.0));
    
    float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
    sunColor += vec3(0.5, 0.3, 0.1) * pow(fresnel, 2.0);
    
    gl_FragColor = vec4(sunColor, 1.0);
  }
`;

// Create sun
const sunGeometry = new THREE.SphereGeometry(50, 32, 32);
const sunMaterial = new THREE.ShaderMaterial({
  vertexShader: sunVertexShader,
  fragmentShader: sunFragmentShader,
  uniforms: {
    time: { value: 0.0 }
  }
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.copy(sunPosition);
scene.add(sun);

// Sun glow effects
const glowGeometry = new THREE.SphereGeometry(50, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffaa00,
  transparent: true,
  opacity: 0.1,
  side: THREE.BackSide
});

const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
sunGlow.position.copy(sunPosition);
scene.add(sunGlow);

const coronaGeometry = new THREE.SphereGeometry(55, 27, 27);
const coronaMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffaa,
  transparent: true,
  opacity: 0.05,
  side: THREE.BackSide
});

const sunCorona = new THREE.Mesh(coronaGeometry, coronaMaterial);
sunCorona.position.copy(sunPosition);
scene.add(sunCorona);

// Enhanced color schemes
const countryColors = new Map();
const companyColors = new Map();
const colorPalettes = {
  country: [
    0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b,
    0xeb4d4b, 0x6c5ce7, 0xa29bfe, 0xfd79a8, 0xe17055,
    0x00b894, 0x00cec9, 0x55a3ff, 0xfeb000, 0xff3838,
    0x2ecc71, 0x9b59b6, 0x34495e, 0xe74c3c, 0x3498db
  ],
  company: [
    0x1abc9c, 0xe67e22, 0x8e44ad, 0x2980b9, 0xf39c12,
    0xc0392b, 0x27ae60, 0xd35400, 0x7f8c8d, 0x16a085,
    0xe74c3c, 0x9b59b6, 0x2c3e50, 0xf1c40f, 0x34495e,
    0xff7675, 0x74b9ff, 0x00b894, 0xfdcb6e, 0x6c5ce7
  ]
};

function getColorForCategory(category, colorMode) {
  if (!category) category = 'Unknown';
  
  const colorMap = colorMode === 'country' ? countryColors : companyColors;
  const palette = colorPalettes[colorMode];
  
  if (!colorMap.has(category)) {
    const colorIndex = colorMap.size % palette.length;
    colorMap.set(category, palette[colorIndex]);
  }
  return colorMap.get(category);
}

// Convert coordinates
function geodeticToThreeJS(latitude, longitude, altitudeKm) {
  const radius = EARTH_RADIUS_THREEJS + (altitudeKm * KM_TO_THREEJS);
  const lat = latitude * Math.PI / 180;
  const lon = longitude * Math.PI / 180;
  
  return {
    x: radius * Math.cos(lat) * Math.cos(lon),
    y: radius * Math.sin(lat),
    z: -radius * Math.cos(lat) * Math.sin(lon)
  };
}

// Geometries for debris shapes
const DEBRIS_GEOMETRIES = {
  box: null,
  cylinder: null,
  octahedron: null,
  sphere: null
};

function initializeDebrisGeometries(quality) {
  const baseSize = 0.004;
  
  DEBRIS_GEOMETRIES.box = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
  DEBRIS_GEOMETRIES.cylinder = new THREE.CylinderGeometry(baseSize * 0.5, baseSize * 0.4, baseSize * 2, quality.segments);
  DEBRIS_GEOMETRIES.octahedron = new THREE.OctahedronGeometry(baseSize);
  DEBRIS_GEOMETRIES.sphere = new THREE.SphereGeometry(baseSize, quality.segments, quality.detail);
}

function getDebrisGeometry() {
  const shapeType = Math.random();
  
  if (shapeType < 0.3) {
    return DEBRIS_GEOMETRIES.box;
  } else if (shapeType < 0.6) {
    return DEBRIS_GEOMETRIES.cylinder;
  } else if (shapeType < 0.8) {
    return DEBRIS_GEOMETRIES.octahedron;
  } else {
    return DEBRIS_GEOMETRIES.sphere;
  }
}

// Create debris texture
function createDebrisTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#888888');
  gradient.addColorStop(0.5, '#555555');
  gradient.addColorStop(1, '#222222');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 64, Math.random() * 64);
    ctx.lineTo(Math.random() * 64, Math.random() * 64);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#663311';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 64, Math.random() * 64, Math.random() * 3 + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const debrisTexture = createDebrisTexture();

// FILTERING SYSTEM
let filteringSystem = {
  currentMode: 'country', // 'country' or 'company'
  selectedFilters: new Set(),
  allFilters: new Map(), // Map of filter name to count
  searchTerm: '',
  isFiltering: false
};

let isModalOpen = false;
let debrisData = [];
let debrisObjects = [];
let instancedMeshes = {};
let currentColorMode = 'country';
let isLoading = false;
let debrisInstanceData = [];

// Camera and focus management
let focusedDebris = null;
let originalCameraPosition = null;
let originalControlsTarget = null;
let isZoomedIn = false;

// Side modal functionality
function createSideModal() {
  const modal = document.createElement('div');
  modal.id = 'sideModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    right: -400px;
    width: 380px;
    height: 100%;
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(30, 30, 30, 0.95));
    backdrop-filter: blur(20px);
    border-left: 2px solid rgba(76, 175, 80, 0.3);
    z-index: 1000;
    transition: right 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
    color: white;
    font-family: Arial, sans-serif;
    overflow-y: auto;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    padding: 20px;
    height: calc(100% - 60px);
    overflow-y: auto;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '× Close';
  closeBtn.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(244, 67, 54, 0.8);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.3s ease;
    z-index: 1001;
  `;
  
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(244, 67, 54, 1)';
    closeBtn.style.transform = 'scale(1.05)';
  });
  
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(244, 67, 54, 0.8)';
    closeBtn.style.transform = 'scale(1)';
  });
  
  closeBtn.onclick = () => {
    hideSideModal();
    resetCameraView();
  };
  
  const modalBody = document.createElement('div');
  modalBody.id = 'sideModalBody';
  modalBody.style.cssText = `
    margin-top: 50px;
  `;
  
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(modalBody);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  return modal;
}

const sideModal = createSideModal();

function showSideModal(debrisObj) {
  if (isModalOpen) return;
  isModalOpen = true;

  setControlsEnabled(false);

  const noradId = debrisObj.tle1 ? debrisObj.tle1.substring(2, 7).trim() : 'N/A';
  
  const getObjectType = (type) => {
    switch(type) {
      case 1: return 'Payload';
      case 2: return 'Rocket Body';
      case 3: return 'Debris';
      default: return 'Unknown';
    }
  };
  
  const getCountryName = (code) => {
    const countryCodes = {
      'US': 'United States',
      'RU': 'Russia',
      'CN': 'China',
      'J': 'Japan',
      'IN': 'India',
      'F': 'France',
      'D': 'Germany',
      'GB': 'United Kingdom',
      'I': 'Italy',
      'CA': 'Canada',
      'EUME': 'European Union',
      'ESA': 'European Space Agency'
    };
    return countryCodes[code] || code || 'Unknown';
  };

  const getSizeCategory = (massKg, diameter, length) => {
    const mass = massKg || 0;
    const size = Math.max(diameter || 0, length || 0);
    
    if (mass > 1000 || size > 5) return 'Large';
    if (mass > 100 || size > 2) return 'Medium';
    if (mass > 10 || size > 0.5) return 'Small';
    return 'Tiny';
  };

  const modalBody = document.getElementById('sideModalBody');
  modalBody.innerHTML = `
    <div style="text-align: center; margin-bottom: 25px; padding: 15px; background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(33, 150, 243, 0.2)); border-radius: 12px; border: 1px solid rgba(76, 175, 80, 0.3);">
      <h2 style="margin: 0; color: #4CAF50; font-size: 20px;">🛰️ ${debrisObj.objectName || 'Unknown Object'}</h2>
      <div style="margin-top: 8px; font-size: 12px; color: #80CBC4;">${debrisObj.altName || ''}</div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3 style="color: #ff6b6b; margin-bottom: 12px; font-size: 16px; padding-bottom: 5px; border-bottom: 2px solid rgba(255, 107, 107, 0.3);">📋 Identification</h3>
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
        <p style="margin: 8px 0;"><span style="color: #ffab40;">NORAD ID:</span> ${noradId}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Object Type:</span> ${getObjectType(debrisObj.type)}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Country:</span> ${getCountryName(debrisObj.countryCode || debrisObj.country)}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Company:</span> ${debrisObj.company || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Status:</span> ${debrisObj.status || 'Unknown'}</p>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #4fc3f7; margin-bottom: 12px; font-size: 16px; padding-bottom: 5px; border-bottom: 2px solid rgba(79, 195, 247, 0.3);">📦 Physical Characteristics</h3>
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Mass:</span> ${debrisObj.massKg > 0 ? debrisObj.massKg + ' kg' : 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Dry Mass:</span> ${debrisObj.dryMass > 0 ? debrisObj.dryMass + ' kg' : 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Launch Mass:</span> ${debrisObj.launchMass > 0 ? debrisObj.launchMass + ' kg' : 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Size Category:</span> ${getSizeCategory(debrisObj.massKg, debrisObj.diameter, debrisObj.length)}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Dimensions:</span> ${[debrisObj.diameter, debrisObj.length, debrisObj.span].filter(Boolean).join(' × ') || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Shape:</span> ${debrisObj.shape || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Bus:</span> ${debrisObj.bus || 'Unknown'}</p>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3 style="color: #f39c12; margin-bottom: 12px; font-size: 16px; padding-bottom: 5px; border-bottom: 2px solid rgba(243, 156, 18, 0.3);">🚀 Launch Information</h3>
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Launch Date:</span> ${debrisObj.launchDate || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Launch Vehicle:</span> ${debrisObj.launchVehicle || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Launch Site:</span> ${debrisObj.launchSite || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Launch Pad:</span> ${debrisObj.launchPad || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Payload:</span> ${debrisObj.payload || 'Unknown'}</p>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3 style="color: #f9ca24; margin-bottom: 12px; font-size: 16px; padding-bottom: 5px; border-bottom: 2px solid rgba(249, 202, 36, 0.3);">🌍 Orbital Data</h3>
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Altitude:</span> ~${Math.round(debrisObj.altitude || 0)} km</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">RCS:</span> ${debrisObj.rcs > 0 ? debrisObj.rcs.toFixed(4) + ' m²' : 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Manufacturer:</span> ${debrisObj.manufacturer || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Stabilization Date:</span> ${debrisObj.stableDate || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Visual Magnitude:</span> ${debrisObj.vmag || 'Unknown'}</p>
        <p style="margin: 8px 0;"><span style="color: #ffab40;">Last Updated:</span> ${debrisObj.lastUpdated ? new Date(debrisObj.lastUpdated).toLocaleDateString() : 'Unknown'}</p>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3 style="color: #e91e63; margin-bottom: 12px; font-size: 16px; padding-bottom: 5px; border-bottom: 2px solid rgba(233, 30, 99, 0.3);">📡 TLE Data</h3>
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px;">
        <pre style="font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.4; margin: 0; color: #81C784; white-space: pre-wrap; word-break: break-all;">
${debrisObj.tle1 || 'TLE Line 1 not available'}
${debrisObj.tle2 || 'TLE Line 2 not available'}</pre>
      </div>
    </div>
  `;
  
  sideModal.style.right = '0px';
}

function hideSideModal() {
  sideModal.style.right = '-400px';
  isModalOpen = false;

  setControlsEnabled(true);
}

// FILTERING SYSTEM IMPLEMENTATION

function updateFilterUI() {
  const filterTitle = document.getElementById('filterTitle');
  const searchFilter = document.getElementById('searchFilter');
  const filterList = document.getElementById('filterList');
  const selectedCountEl = document.getElementById('selectedCount');
  const visibleObjectsEl = document.getElementById('visibleObjects');
  
  if (!filterTitle || !searchFilter || !filterList) return;
  
  // Update title and placeholder
  const mode = filteringSystem.currentMode;
  filterTitle.textContent = `Filter by ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
  searchFilter.placeholder = `Search ${mode}s...`;
  
  // Get filtered list based on search term
  const filteredItems = Array.from(filteringSystem.allFilters.entries())
    .filter(([name]) => 
      name.toLowerCase().includes(filteringSystem.searchTerm.toLowerCase())
    )
    .sort((a, b) => b[1] - a[1]); // Sort by count, descending
  
  // Clear and rebuild filter list
  filterList.innerHTML = '';
  
  filteredItems.forEach(([name, count]) => {
    const filterItem = document.createElement('div');
    filterItem.className = 'filter-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `filter-${name}`;
    checkbox.checked = filteringSystem.selectedFilters.has(name);
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        filteringSystem.selectedFilters.add(name);
      } else {
        filteringSystem.selectedFilters.delete(name);
      }
      applyFilters();
      updateFilterStats();
    });
    
    const label = document.createElement('label');
    label.htmlFor = `filter-${name}`;
    label.innerHTML = `
      <span class="color-indicator" style="background-color: #${getColorForCategory(name, mode).toString(16).padStart(6, '0')};"></span>
      <span>${name}</span>
      <span class="count">${count}</span>
    `;
    
    filterItem.appendChild(checkbox);
    filterItem.appendChild(label);
    filterList.appendChild(filterItem);
  });
  
  updateFilterStats();
}

function updateFilterStats() {
  const selectedCountEl = document.getElementById('selectedCount');
  const visibleObjectsEl = document.getElementById('visibleObjects');
  
  if (selectedCountEl) {
    selectedCountEl.textContent = filteringSystem.selectedFilters.size;
  }
  
  if (visibleObjectsEl) {
    visibleObjectsEl.textContent = getVisibleDebrisCount();
  }
}

function getVisibleDebrisCount() {
  if (filteringSystem.selectedFilters.size === 0) {
    return 0; // No debris visible when no filters are selected
  }
  
  return debrisInstanceData.filter(debris => {
    const category = filteringSystem.currentMode === 'country' 
      ? debris.data.country 
      : debris.data.company;
    return filteringSystem.selectedFilters.has(category || 'Unknown');
  }).length;
}

function buildFilterData() {
  filteringSystem.allFilters.clear();
  
  debrisInstanceData.forEach(debris => {
    const category = filteringSystem.currentMode === 'country' 
      ? debris.data.country 
      : debris.data.company;
    const key = category || 'Unknown';
    
    if (!filteringSystem.allFilters.has(key)) {
      filteringSystem.allFilters.set(key, 0);
    }
    filteringSystem.allFilters.set(key, filteringSystem.allFilters.get(key) + 1);
  });
  
  // Initialize with all filters selected if none are selected
  if (filteringSystem.selectedFilters.size === 0) {
    filteringSystem.allFilters.forEach((count, name) => {
      filteringSystem.selectedFilters.add(name);
    });
  }
}

function applyFilters() {
  filteringSystem.isFiltering = true;
  const tempObject = new THREE.Object3D();
  const hiddenScale = new THREE.Vector3(0, 0, 0);
  const normalScale = new THREE.Vector3(1, 1, 1);
  const matrix = new THREE.Matrix4();
  
  // Apply filters to each geometry type
  Object.keys(instancedMeshes).forEach(geometryType => {
    const mesh = instancedMeshes[geometryType];
    if (!mesh) return;
    
    let instanceIndex = 0;
    
    debrisInstanceData.forEach(debris => {
      if (debris.geometryType === geometryType) {
        const category = filteringSystem.currentMode === 'country' 
          ? debris.data.country 
          : debris.data.company;
        
        // Fixed logic: Show debris only if filters are selected AND the category matches
        const isVisible = filteringSystem.selectedFilters.size > 0 && 
                          filteringSystem.selectedFilters.has(category || 'Unknown');
        
        // Get current matrix
        mesh.getMatrixAt(instanceIndex, matrix);
        tempObject.position.setFromMatrixPosition(matrix);
        tempObject.rotation.setFromRotationMatrix(matrix);
        
        // Set scale based on visibility
        if (isVisible) {
          tempObject.scale.set(debris.size, debris.size, debris.size);
        } else {
          tempObject.scale.copy(hiddenScale);
        }
        
        tempObject.updateMatrix();
        mesh.setMatrixAt(instanceIndex, tempObject.matrix);
        
        instanceIndex++;
      }
    });
    
    mesh.instanceMatrix.needsUpdate = true;
  });
}

function resetFilters() {
  filteringSystem.selectedFilters.clear();
  filteringSystem.allFilters.forEach((count, name) => {
    filteringSystem.selectedFilters.add(name);
  });
  applyFilters();
  updateFilterUI();
}

function selectAllFilters() {
  const filteredItems = Array.from(filteringSystem.allFilters.keys())
    .filter(name => name.toLowerCase().includes(filteringSystem.searchTerm.toLowerCase()));
  
  filteredItems.forEach(name => {
    filteringSystem.selectedFilters.add(name);
  });
  
  applyFilters();
  updateFilterUI();
}

function selectNoneFilters() {
  const filteredItems = Array.from(filteringSystem.allFilters.keys())
    .filter(name => name.toLowerCase().includes(filteringSystem.searchTerm.toLowerCase()));
  
  filteredItems.forEach(name => {
    filteringSystem.selectedFilters.delete(name);
  });
  
  applyFilters();
  updateFilterUI();
}

// Mouse interaction adapted for filtering
function onMouseClick(event) {
  if (isLoading || isModalOpen) return;
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  // First check if we hit Earth
  const earthIntersects = raycaster.intersectObject(earth);
  
  // Then check debris intersections
  const instancedMeshArray = Object.values(instancedMeshes);
  const debrisIntersects = raycaster.intersectObjects(instancedMeshArray);
  
  // If we hit both Earth and debris, only allow interaction if debris is closer
  if (earthIntersects.length > 0 && debrisIntersects.length > 0) {
    const earthDistance = earthIntersects[0].distance;
    const debrisDistance = debrisIntersects[0].distance;
    
    // If Earth is closer, don't interact with debris
    if (earthDistance < debrisDistance) {
      return;
    }
  }
  
  // If we only hit Earth or debris is behind Earth, return
  if (earthIntersects.length > 0 && debrisIntersects.length === 0) {
    return;
  }
  
  // Process debris interaction (existing code)
  if (debrisIntersects.length > 0) {
    const intersect = debrisIntersects[0];
    const instanceId = intersect.instanceId;
    
    if (instanceId !== undefined) {
      const intersectedMesh = intersect.object;
      let geometryType = null;
      
      Object.entries(instancedMeshes).forEach(([type, mesh]) => {
        if (mesh === intersectedMesh) {
          geometryType = type;
        }
      });
      
      if (geometryType) {
        let currentIndex = 0;
        for (const debris of debrisInstanceData) {
          if (debris.geometryType === geometryType) {
            if (currentIndex === instanceId) {
              // Check if debris is visible (not filtered out)
              const category = filteringSystem.currentMode === 'country' 
                ? debris.data.country 
                : debris.data.company;
              const isVisible = filteringSystem.selectedFilters.has(category || 'Unknown');
              
              if (isVisible) {
                focusOnDebris(debris, currentIndex, geometryType);
                showSideModal(debris.data);
              }
              return;
            }
            currentIndex++;
          }
        }
      }
    }
  }
}

function focusOnDebris(debris, instanceId, geometryType) {
  if (!isZoomedIn) {
    originalCameraPosition = camera.position.clone();
    originalControlsTarget = controls.target.clone();
  }
  
  focusedDebris = { debris, instanceId, geometryType };
  isZoomedIn = true;
  
  // Hide other debris (existing code)
  Object.entries(instancedMeshes).forEach(([type, mesh]) => {
    if (type !== geometryType) {
      mesh.visible = false;
    } else {
      hideAllInstances(mesh, instanceId);
    }
  });
  
  // Get the actual world position of the debris from the instancedMesh
  // The instancedMesh already has the current rotation applied
  const matrix = new THREE.Matrix4();
  const instancedMesh = instancedMeshes[geometryType];
  instancedMesh.getMatrixAt(instanceId, matrix);
  
  // Apply the instancedMesh's current world transformation
  const meshWorldMatrix = instancedMesh.matrixWorld.clone();
  matrix.premultiply(meshWorldMatrix);
  
  const debrisPos = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(debrisPos, rotation, scale);
  
  if (currentDebrisModel) {
    scene.remove(currentDebrisModel);
    currentDebrisModel = null;
    console.log('Previous 3D model removed');
  }
  
  // Create and display the 3D model if available
  if (isModelLoaded && debrisModel) {
    // Remove any existing 3D model
    if (currentDebrisModel) {
      scene.remove(currentDebrisModel);
      currentDebrisModel = null;
    }
    
    // Clone the loaded model
    currentDebrisModel = debrisModel.clone();
    
    // Position the 3D model at the debris location (already rotated with Earth)
    currentDebrisModel.position.copy(debrisPos);
    
    // Apply random rotation to make it more interesting
    currentDebrisModel.rotation.x = Math.random() * Math.PI * 2;
    currentDebrisModel.rotation.y = Math.random() * Math.PI * 2;
    currentDebrisModel.rotation.z = Math.random() * Math.PI * 2;
    
    // Scale based on debris size (make it visible but realistic)
    const modelScale = Math.max(debris.size * 0.00005, 0.00005);
    currentDebrisModel.scale.set(modelScale, modelScale, modelScale);
    
    // Add animation to the model
    currentDebrisModel.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.6) * 0.01,
        y: (Math.random() - 0.6) * 0.01,
        z: (Math.random() - 0.6) * 0.01
      }
    };
    
    scene.add(currentDebrisModel);
    console.log('3D debris model displayed at position:', debrisPos);
  }
  
  // Calculate appropriate zoom distance based on debris size
  const debrisSize = Math.max(debris.size, 0.001);
  const distance = Math.max(debrisSize * 0.05, 0.2); // Increased distance for 3D model
  
  // Calculate camera position relative to debris
  const cameraDirection = camera.position.clone().sub(controls.target).normalize();
  const newCameraPos = debrisPos.clone().add(cameraDirection.multiplyScalar(distance));
  
  // Ensure camera doesn't go inside Earth
  const earthCenter = new THREE.Vector3(0, 0, 0);
  const distanceFromEarth = newCameraPos.distanceTo(earthCenter);
  if (distanceFromEarth < EARTH_RADIUS_THREEJS * 1.1) {
    const safeDirection = newCameraPos.clone().normalize();
    newCameraPos.copy(safeDirection.multiplyScalar(EARTH_RADIUS_THREEJS * 1.2));
  }
  
  // Animate camera movement
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const duration = 1500;
  const startTime = performance.now();
  
  function animateCamera(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);
    
    camera.position.lerpVectors(startPos, newCameraPos, easeProgress);
    controls.target.lerpVectors(startTarget, debrisPos, easeProgress);
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    }
  }
  
  requestAnimationFrame(animateCamera);
  updateZoomUI(true);
}

function hideAllInstances(instancedMesh) {
  const tempObject = new THREE.Object3D();
  const hiddenScale = new THREE.Vector3(0, 0, 0);
  const matrix = new THREE.Matrix4();
  
  for (let i = 0; i < instancedMesh.count; i++) {
    instancedMesh.getMatrixAt(i, matrix);
    tempObject.position.setFromMatrixPosition(matrix);
    tempObject.rotation.setFromRotationMatrix(matrix);
    tempObject.scale.copy(hiddenScale); // Esconde TODAS as instâncias
    tempObject.updateMatrix();
    instancedMesh.setMatrixAt(i, tempObject.matrix);
  }
  
  instancedMesh.instanceMatrix.needsUpdate = true;
}

// Função alternativa se você quiser esconder todos os debris de uma vez
function hideAllDebris() {
  Object.entries(instancedMeshes).forEach(([type, mesh]) => {
    hideAllInstances(mesh);
  });
}

// Se você quiser também uma função para mostrar todas as instâncias novamente
function showAllInstances(instancedMesh) {
  const tempObject = new THREE.Object3D();
  const matrix = new THREE.Matrix4();
  
  let instanceIndex = 0;
  
  debrisInstanceData.forEach(debris => {
    if (debris.geometryType === getGeometryTypeForMesh(instancedMesh)) {
      tempObject.position.set(debris.position.x, debris.position.y, debris.position.z);
      tempObject.rotation.set(debris.rotation.x, debris.rotation.y, debris.rotation.z);
      tempObject.scale.set(debris.size, debris.size, debris.size);
      tempObject.updateMatrix();
      instancedMesh.setMatrixAt(instanceIndex, tempObject.matrix);
      instanceIndex++;
    }
  });
  
  instancedMesh.instanceMatrix.needsUpdate = true;
}

// Função auxiliar para identificar o tipo de geometria de um mesh
function getGeometryTypeForMesh(mesh) {
  for (const [type, meshInstance] of Object.entries(instancedMeshes)) {
    if (meshInstance === mesh) {
      return type;
    }
  }
  return null;
}

function restoreAllInstances() {
  if (!focusedDebris) return;
  
  Object.entries(instancedMeshes).forEach(([type, mesh]) => {
    mesh.visible = true;
    
    let instanceIndex = 0;
    const matrix = new THREE.Matrix4();
    
    debrisInstanceData.forEach(debris => {
      if (debris.geometryType === type) {
        matrix.makeRotationFromEuler(new THREE.Euler(
          debris.rotation.x,
          debris.rotation.y,
          debris.rotation.z
        ));
        matrix.scale(new THREE.Vector3(debris.size, debris.size, debris.size));
        matrix.setPosition(debris.position.x, debris.position.y, debris.position.z);
        
        mesh.setMatrixAt(instanceIndex, matrix);
        instanceIndex++;
      }
    });
    
    mesh.instanceMatrix.needsUpdate = true;
  });
  
  // Reapply filters after restoring
  applyFilters();
}

function resetCameraView() {
  if (!isZoomedIn || !originalCameraPosition || !originalControlsTarget) return;
  
  // ⭐⭐ REMOVER O MODELO 3D AO SAIR DO ZOOM ⭐⭐
  if (currentDebrisModel) {
    scene.remove(currentDebrisModel);
    currentDebrisModel = null;
    console.log('3D debris model removed');
  }
  
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const duration = 1500;
  const startTime = performance.now();
  
  function animateCamera(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);
    
    camera.position.lerpVectors(startPos, originalCameraPosition, easeProgress);
    controls.target.lerpVectors(startTarget, originalControlsTarget, easeProgress);
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      restoreAllInstances();
      focusedDebris = null;
      isZoomedIn = false;
      updateZoomUI(false);
      hideSideModal();
      
      // Ensure controls are re-enabled
      setControlsEnabled(true);
    }
  }
  
  requestAnimationFrame(animateCamera);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function updateZoomUI(zoomed) {
  
  if (zoomed) {
    
    
  } else if (!zoomed) {
  }
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (isZoomedIn && isModalOpen) {
      resetCameraView();
      hideSideModal();
    }
  }
  if (event.key === 'r' || event.key === 'R') {
    if (isZoomedIn && isModalOpen) {
      resetCameraView();
      hideSideModal();
    }
  }
});

window.addEventListener('click', onMouseClick);

// Create instanced debris mesh
function createInstancedDebris(geometryType, count, quality) {
  const geometry = DEBRIS_GEOMETRIES[geometryType];
  const material = new THREE.MeshBasicMaterial({
    map: debrisTexture,
    transparent: false
  });
  
  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
  instancedMesh.frustumCulled = PERFORMANCE_SETTINGS.FRUSTUM_CULLING;
  
  return instancedMesh;
}

async function loadDebris() {
  if (isLoading) return;
  isLoading = true;
  
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'block';
  
  try {
    console.log('Loading debris data...');
    
    // First get the total count
    const countRes = await fetch('http://localhost:3000/space_debris/count');
    const countData = await countRes.json();
    const totalCount = countData.count;
    
    console.log(`Total debris in database: ${totalCount}`);
    
    // Calculate how many to actually load based on settings
    const maxCount = PERFORMANCE_SETTINGS[PERFORMANCE_SETTINGS.CURRENT_QUALITY].maxDebris;
    const requestCount = Math.min(PERFORMANCE_SETTINGS.CURRENT_COUNT, maxCount, totalCount);
    
    // Load the debris with limit
    const res = await fetch(`http://localhost:3000/space_debris?limit=${requestCount}`);
    const raw = await res.json();
    
    // Filter for valid TLE data
    const validDebris = raw.filter(d => d.tle1 && d.tle2);
    debrisData = validDebris;
    
    console.log(`Processing ${debrisData.length} debris objects with instancing`);

    // Clear existing objects
    Object.values(instancedMeshes).forEach(mesh => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    instancedMeshes = {};
    debrisObjects = [];
    debrisInstanceData = [];
    
    countryColors.clear();
    companyColors.clear();

    // Initialize geometries
    const quality = PERFORMANCE_SETTINGS[PERFORMANCE_SETTINGS.CURRENT_QUALITY];
    initializeDebrisGeometries(quality);

    const now = new Date();
    let validPositions = 0;
    
    // Count objects by geometry type
    const typeCounts = { box: 0, cylinder: 0, octahedron: 0, sphere: 0 };
    
    // Process debris data
    for (let i = 0; i < debrisData.length; i++) {
      const sat = debrisData[i];
      let position, altitude;
      
      try {
        const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
        const posVel = satellite.propagate(satrec, now);
        
        if (posVel.position && typeof posVel.position.x === 'number') {
          const gmst = satellite.gstime(now);
          const geodetic = satellite.eciToGeodetic(posVel.position, gmst);
          
          const lat = geodetic.latitude * 180 / Math.PI;
          const lon = geodetic.longitude * 180 / Math.PI;
          altitude = Math.max(geodetic.height, 300);
          
          if (!isNaN(lat) && !isNaN(lon) && !isNaN(altitude) && 
              lat >= -90 && lat <= 90 && altitude > 0) {
            position = geodeticToThreeJS(lat, lon, altitude);
            validPositions++;
          }
        }
      } catch (error) {
        // Skip invalid entries
      }
      
      if (!position) {
        altitude = 300 + Math.random() * 1000;
        const lat = (Math.random() - 0.5) * 180;
        const lon = (Math.random() - 0.5) * 360;
        position = geodeticToThreeJS(lat, lon, altitude);
      }

      const size = Math.random() < 0.1 ? Math.random() * 2 + 3 : Math.random() * 1.5 + 0.5;
      
      // Determine geometry type
      const shapeType = Math.random();
      let geometryType;
      if (shapeType < 0.3) geometryType = 'box';
      else if (shapeType < 0.6) geometryType = 'cylinder';
      else if (shapeType < 0.8) geometryType = 'octahedron';
      else geometryType = 'sphere';
      
      typeCounts[geometryType]++;
      
      // Store instance data
      debrisInstanceData.push({
        position,
        size,
        rotation: {
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2
        },
        geometryType,
        data: {
          ...sat,
          altitude,
          country: sat.country || 'Unknown',
          company: sat.company || 'Unknown'
        }
      });
    }
    
    // Create InstancedMesh for each geometry type
    const geometryTypes = ['box', 'cylinder', 'octahedron', 'sphere'];
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    
    geometryTypes.forEach(type => {
      if (typeCounts[type] > 0) {
        const instancedMesh = createInstancedDebris(type, typeCounts[type], quality);
        instancedMeshes[type] = instancedMesh;
        scene.add(instancedMesh);
        
        let instanceIndex = 0;
        
        debrisInstanceData.forEach((debris, globalIndex) => {
          if (debris.geometryType === type) {
            // Set transformation matrix
            matrix.makeRotationFromEuler(new THREE.Euler(
              debris.rotation.x,
              debris.rotation.y,
              debris.rotation.z
            ));
            matrix.scale(new THREE.Vector3(debris.size, debris.size, debris.size));
            matrix.setPosition(debris.position.x, debris.position.y, debris.position.z);
            
            instancedMesh.setMatrixAt(instanceIndex, matrix);
            
            // Set color based on current mode
            const colorValue = getColorForCategory(
              currentColorMode === 'country' ? debris.data.country : debris.data.company,
              currentColorMode
            );
            color.setHex(colorValue);
            instancedMesh.setColorAt(instanceIndex, color);
            
            instanceIndex++;
          }
        });
        
        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
      }
    });

    // Initialize filtering system
    filteringSystem.currentMode = currentColorMode;
    buildFilterData();
    updateFilterUI();
    applyFilters();

    // Update UI with counts
    const debrisCountEl = document.getElementById('debrisCount');
    if (debrisCountEl) debrisCountEl.textContent = debrisData.length;
    
    const totalCountEl = document.getElementById('totalCount');
    if (totalCountEl) totalCountEl.textContent = totalCount;

    console.log(`Created ${validPositions} valid positions, ${debrisData.length - validPositions} fallback positions using instancing`);
    
  } catch (error) {
    console.error('Error loading debris:', error);
    
    // Fallback to old endpoint if new one fails
    try {
      console.log('Trying fallback endpoint...');
      const res = await fetch('http://localhost:3000/space_debris');
      const raw = await res.json();
      
      const validDebris = raw.filter(d => d.tle1 && d.tle2);
      const maxCount = PERFORMANCE_SETTINGS[PERFORMANCE_SETTINGS.CURRENT_QUALITY].maxDebris;
      debrisData = validDebris.slice(0, Math.min(PERFORMANCE_SETTINGS.CURRENT_COUNT, maxCount));
      
      // Continue with existing processing logic...
      console.log(`Fallback: Processing ${debrisData.length} debris objects`);
      
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
    }
  } finally {
    isLoading = false;
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// Add these new functions for loading filtered data:

async function loadDebrisFiltered(filters = {}) {
  if (isLoading) return;
  isLoading = true;
  
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'block';
  
  try {
    console.log('Loading filtered debris data...', filters);
    
    // Build query parameters
    const params = new URLSearchParams();
    const maxCount = PERFORMANCE_SETTINGS[PERFORMANCE_SETTINGS.CURRENT_QUALITY].maxDebris;
    const requestCount = Math.min(PERFORMANCE_SETTINGS.CURRENT_COUNT, maxCount);
    
    params.append('limit', requestCount);
    
    if (filters.country) params.append('country', filters.country);
    if (filters.company) params.append('company', filters.company);
    if (filters.type !== null && filters.type !== undefined) params.append('type', filters.type);
    if (filters.minMass) params.append('minMass', filters.minMass);
    if (filters.maxMass) params.append('maxMass', filters.maxMass);
    if (filters.search) params.append('search', filters.search);
    
    const res = await fetch(`http://localhost:3000/space_debris/filtered?${params}`);
    const raw = await res.json();
    
    const validDebris = raw.filter(d => d.tle1 && d.tle2);
    debrisData = validDebris;
    
    console.log(`Processing ${debrisData.length} filtered debris objects`);
    
    // Continue with existing processing logic...
    // (Same as in loadDebris function)
    
  } catch (error) {
    console.error('Error loading filtered debris:', error);
  } finally {
    isLoading = false;
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// Add function to load statistics
async function loadDebrisStatistics() {
  try {
    const res = await fetch('http://localhost:3000/space_debris/statistics');
    const stats = await res.json();
    
    console.log('Debris statistics:', stats);
    
    // Update UI with statistics
    updateStatisticsUI(stats);
    
    return stats;
  } catch (error) {
    console.error('Error loading statistics:', error);
    return null;
  }
}

// Add function to update statistics UI
function updateStatisticsUI(stats) {
  // Update total count
  const totalCountEl = document.getElementById('totalDebrisCount');
  if (totalCountEl) totalCountEl.textContent = stats.totalCount?.toLocaleString() || '0';
  
  // Update average mass
  const avgMassEl = document.getElementById('avgMass');
  if (avgMassEl) avgMassEl.textContent = stats.avgMass ? `${stats.avgMass} kg` : 'N/A';
  
  // Update total mass
  const totalMassEl = document.getElementById('totalMass');
  if (totalMassEl) totalMassEl.textContent = stats.totalMass ? `${(stats.totalMass / 1000).toFixed(1)} tonnes` : 'N/A';
  
  // Update type distribution
  if (stats.typeDistribution) {
    const typeList = document.getElementById('typeDistribution');
    if (typeList) {
      typeList.innerHTML = stats.typeDistribution
        .slice(0, 5)
        .map(item => `<li>${getObjectTypeName(item._id)}: ${item.count}</li>`)
        .join('');
    }
  }
  
  // Update country distribution
  if (stats.countryDistribution) {
    const countryList = document.getElementById('countryDistribution');
    if (countryList) {
      countryList.innerHTML = stats.countryDistribution
        .slice(0, 5)
        .map(item => `<li>${item._id}: ${item.count}</li>`)
        .join('');
    }
  }
}

function setControlsEnabled(enabled) {
  const controlsDiv = document.getElementById('controls');
  if (enabled) {
    controlsDiv.classList.remove('disabled');
  } else {
    controlsDiv.classList.add('disabled');
  }
}

// Helper function to get readable object type names
function getObjectTypeName(type) {
  switch(type) {
    case 1: return 'Payload';
    case 2: return 'Rocket Body';
    case 3: return 'Debris';
    default: return 'Unknown';
  }
}

// Load statistics on initialization
loadDebrisStatistics();

function updateColors(colorMode) {
  if (isLoading) return;
  
  console.log(`Updating colors by ${colorMode}`);
  currentColorMode = colorMode;

  // Update colors using instancing
  const color = new THREE.Color();
  const geometryTypes = ['box', 'cylinder', 'octahedron', 'sphere'];
  
  geometryTypes.forEach(type => {
    const instancedMesh = instancedMeshes[type];
    if (!instancedMesh) return;
    
    let instanceIndex = 0;
    
    debrisInstanceData.forEach(debris => {
      if (debris.geometryType === type) {
        const colorValue = getColorForCategory(
          colorMode === 'country' ? debris.data.country : debris.data.company,
          colorMode
        );
        color.setHex(colorValue);
        instancedMesh.setColorAt(instanceIndex, color);
        instanceIndex++;
      }
    });
    
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
  });

  // Update filtering system
  filteringSystem.currentMode = colorMode;
  buildFilterData();
  updateFilterUI();
  applyFilters();

  document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
  const activeButton = document.getElementById(`colorBy${colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}`);
  if (activeButton) activeButton.classList.add('active');
}

function setQuality(qualityLevel) {
  console.log(`Setting quality to ${qualityLevel}`);
  PERFORMANCE_SETTINGS.CURRENT_QUALITY = qualityLevel;
  loadDebris();
}

function setDebrisCount(count) {
  console.log(`Setting debris count to ${count}`);
  PERFORMANCE_SETTINGS.CURRENT_COUNT = parseInt(count);
  loadDebris();
}

// Initialize
loadDebris();

// Event listeners for color mode buttons
document.getElementById('colorByCountry')?.addEventListener('click', () => updateColors('country'));
document.getElementById('colorByCompany')?.addEventListener('click', () => updateColors('company'));

// Event listeners for quality and count selectors
document.getElementById('qualitySelect')?.addEventListener('change', (e) => {
  setQuality(e.target.value);
});

document.getElementById('countSelect')?.addEventListener('change', (e) => {
  setDebrisCount(e.target.value);
});

// Event listeners for filtering system
document.getElementById('searchFilter')?.addEventListener('input', (e) => {
  filteringSystem.searchTerm = e.target.value;
  updateFilterUI();
});

document.getElementById('selectAllFilter')?.addEventListener('click', selectAllFilters);
document.getElementById('selectNoneFilter')?.addEventListener('click', selectNoneFilters);
document.getElementById('resetFilter')?.addEventListener('click', resetFilters);

// Animation loop
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;
let animationTime = 0;

function animate() {
  requestAnimationFrame(animate);
  
  frameCount++;
  const now = performance.now();
  animationTime = now * 0.001;
  
  // Update FPS once per second
  if (now - lastTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (now - lastTime));
    const fpsEl = document.getElementById('fps');
    if (fpsEl) fpsEl.textContent = fps;
    frameCount = 0;
    lastTime = now;
    
    renderer.info.reset();
  }

  // Rotate Earth slowly on its axis (very slow rotation) - only when not loading and not focused on debris
  if (!isLoading && !isZoomedIn) {
    earth.rotation.y += 0.0001;

    // Rotate all debris along with Earth
    Object.values(instancedMeshes).forEach(mesh => {
      if (mesh) {
        mesh.rotation.y += 0.0001; // Same rotation as Earth
      }
    });
  }

  // Animate the 3D debris model if it exists
  if (currentDebrisModel && currentDebrisModel.userData.rotationSpeed) {
    currentDebrisModel.rotation.x += currentDebrisModel.userData.rotationSpeed.x;
    currentDebrisModel.rotation.y += currentDebrisModel.userData.rotationSpeed.y;
    currentDebrisModel.rotation.z += currentDebrisModel.userData.rotationSpeed.z;
  }

  // Update shader uniforms
  if (spaceSkyMaterial && spaceSkyMaterial.uniforms) {
    spaceSkyMaterial.uniforms.time.value = animationTime;
    spaceSkyMaterial.uniforms.cameraPosition.value.copy(camera.position);
  }
  
  if (atmosphereMaterial && atmosphereMaterial.uniforms) {
    atmosphereMaterial.uniforms.time.value = animationTime;
  }
  
  if (sunMaterial && sunMaterial.uniforms) {
    sunMaterial.uniforms.time.value = animationTime;
  }

  // Apply axial tilt to debris - this ensures consistent positioning
  Object.values(instancedMeshes).forEach(mesh => {
    if (mesh) {
      mesh.rotation.z = EARTH_AXIAL_TILT;
    }
  });

  // Update controls
  if (controls.enableDamping) {
    controls.update();
  }
  
  renderer.render(scene, camera);
}
animate();

// Handle window resize
function handleResize() {
  const canvasSize = getCanvasSize();
  const width = canvasSize.width;
  const height = canvasSize.height;

  renderer.setSize(canvasSize.width, canvasSize.height);
  
  console.log(`Resizing canvas to: ${width}x${height}`); // Debug log
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  // Update pixel ratio if needed
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Add fullscreen event listeners (add this after your existing event listeners)
// Replace the existing resize event listener section with this:

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 100);
});

// Add fullscreen change event listeners
function handleFullscreenChange() {
  console.log('Fullscreen state changed'); // Debug log
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 150); // Slightly longer delay for fullscreen
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

// Enhanced ResizeObserver (replace the existing one)
if (window.ResizeObserver) {
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      if (entry.target === document.body) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
      }
    }
  });
  
  resizeObserver.observe(document.body);
  
  // Also observe the document element for fullscreen changes
  resizeObserver.observe(document.documentElement);
}