import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as satellite from 'https://cdn.jsdelivr.net/npm/satellite.js@6.0.1/dist/satellite.min.js';

// Constants
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_THREEJS = 1;
const KM_TO_THREEJS = EARTH_RADIUS_THREEJS / EARTH_RADIUS_KM;

// Performance settings
const PERFORMANCE_SETTINGS = {
  LOW_QUALITY: { segments: 4, detail: 4 },
  MEDIUM_QUALITY: { segments: 6, detail: 6 },
  HIGH_QUALITY: { segments: 8, detail: 8 },
  CURRENT_QUALITY: 'MEDIUM_QUALITY',
  CURRENT_COUNT: 10000
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
camera.position.set(5, 3, 5);

// Raycaster for mouse picking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Earth with texture
const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS_THREEJS, 64, 64);
const textureLoader = new THREE.TextureLoader();

// Load earth texture (using a publicly available earth texture)
const earthTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({ 
  map: earthTexture,
  shininess: 30,
  specular: 0x222222
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.castShadow = false;
earth.receiveShadow = false;
scene.add(earth);

// Enhanced atmosphere
const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS_THREEJS * 1.025, 32, 32);
const atmosphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x88ccff,
  transparent: true,
  opacity: 0.15,
  side: THREE.BackSide
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
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Create the Sun
function createSunTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Create radial gradient for the sun
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.1, '#ffffaa');
  gradient.addColorStop(0.3, '#ffaa00');
  gradient.addColorStop(0.6, '#ff6600');
  gradient.addColorStop(0.8, '#cc3300');
  gradient.addColorStop(1.0, '#990000');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add some solar flares/texture
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = Math.random() * 30 + 10;
    
    const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    flareGradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
    flareGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    
    ctx.fillStyle = flareGradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  
  return new THREE.CanvasTexture(canvas);
}

const sunTexture = createSunTexture();

// Position the sun far away
const sunDistance = 800;
const sunPosition = new THREE.Vector3(sunDistance, sunDistance * 0.3, -sunDistance * 0.5);

// Create sun geometry and material
const sunGeometry = new THREE.SphereGeometry(50, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
  emissive: 0xffaa00,
  emissiveIntensity: 0.3,
  transparent: true,
  opacity: 0.9
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.copy(sunPosition);
scene.add(sun);

// Create sun glow effect
const glowGeometry = new THREE.SphereGeometry(55, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffaa00,
  transparent: true,
  opacity: 0.1,
  side: THREE.BackSide
});

const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
sunGlow.position.copy(sunPosition);
scene.add(sunGlow);

// Create corona effect
const coronaGeometry = new THREE.SphereGeometry(70, 32, 32);
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

// Create random debris shapes
function createDebrisGeometry(size, quality) {
  const shapeType = Math.random();
  
  if (shapeType < 0.3) {
    // Box shape for debris
    const width = size * (0.8 + Math.random() * 0.4);
    const height = size * (0.8 + Math.random() * 0.4);
    const depth = size * (0.8 + Math.random() * 0.4);
    return new THREE.BoxGeometry(width, height, depth);
  } else if (shapeType < 0.6) {
    // Cylinder for rocket parts
    const radius = size * 0.5;
    const height = size * (1.5 + Math.random());
    return new THREE.CylinderGeometry(radius, radius * 0.8, height, quality.segments);
  } else if (shapeType < 0.8) {
    // Octahedron for complex debris
    return new THREE.OctahedronGeometry(size);
  } else {
    // Sphere for satellites
    const radius = size * (0.8 + Math.random() * 0.4);
    return new THREE.SphereGeometry(radius, quality.segments, quality.detail);
  }
}

// Create debris texture
function createDebrisTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Base metallic color
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#888888');
  gradient.addColorStop(0.5, '#555555');
  gradient.addColorStop(1, '#222222');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  // Add some random scratches and wear
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 64, Math.random() * 64);
    ctx.lineTo(Math.random() * 64, Math.random() * 64);
    ctx.stroke();
  }
  
  // Add some rust spots
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

let debrisData = [];
let debrisObjects = [];
let currentColorMode = 'country';
let isLoading = false;

// Modal functionality
function createModal() {
  const modal = document.createElement('div');
  modal.id = 'debrisModal';
  modal.style.cssText = `
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background-color: #1a1a1a;
    margin: 5% auto;
    padding: 30px;
    border-radius: 15px;
    width: 80%;
    max-width: 600px;
    color: white;
    font-family: Arial, sans-serif;
    box-shadow: 0 20px 40px rgba(0,0,0,0.8);
  `;
  
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
  `;
  
  closeBtn.onclick = () => modal.style.display = 'none';
  
  const modalBody = document.createElement('div');
  modalBody.id = 'modalBody';
  
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(modalBody);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
  
  return modal;
}

const modal = createModal();

function showDebrisInfo(debrisObj) {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <h2 style="margin-top: 0; color: #4CAF50;">Space Debris Information</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
      <div>
        <h3 style="color: #ff6b6b; margin-bottom: 10px;">Basic Info</h3>
        <p><strong>Name:</strong> ${debrisObj.name || 'Unknown'}</p>
        <p><strong>Country:</strong> ${debrisObj.country || 'Unknown'}</p>
        <p><strong>Company:</strong> ${debrisObj.company || 'Unknown'}</p>
        <p><strong>NORAD ID:</strong> ${debrisObj.norad_id || 'N/A'}</p>
      </div>
      <div>
        <h3 style="color: #4ecdc4; margin-bottom: 10px;">Orbital Data</h3>
        <p><strong>Launch Date:</strong> ${debrisObj.launch_date || 'Unknown'}</p>
        <p><strong>Size Category:</strong> ${debrisObj.size > 10 ? 'Large' : debrisObj.size > 3 ? 'Medium' : debrisObj.size > 1 ? 'Small' : 'Tiny'}</p>
        <p><strong>Altitude:</strong> ~${Math.round(debrisObj.altitude || 0)} km</p>
        <p><strong>Object Type:</strong> ${debrisObj.object_type || 'Debris'}</p>
      </div>
    </div>
    <div style="margin-top: 20px;">
      <h3 style="color: #f9ca24; margin-bottom: 10px;">TLE Data</h3>
      <p style="font-family: monospace; font-size: 12px; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px;">
        ${debrisObj.tle1 || 'TLE Line 1 not available'}<br>
        ${debrisObj.tle2 || 'TLE Line 2 not available'}
      </p>
    </div>
  `;
  modal.style.display = 'block';
}

// Mouse interaction
function onMouseClick(event) {
  if (isLoading) return;
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  // Check for intersections with debris objects
  const intersects = raycaster.intersectObjects(debrisObjects.map(obj => obj.mesh));
  
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    const debrisObj = debrisObjects.find(obj => obj.mesh === intersectedObject);
    if (debrisObj) {
      showDebrisInfo(debrisObj.data);
    }
  }
}

window.addEventListener('click', onMouseClick);

async function loadDebris() {
  if (isLoading) return;
  isLoading = true;
  
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'block';
  
  try {
    console.log('Loading debris data...');
    const res = await fetch('http://localhost:3000/space_debris');
    const raw = await res.json();
    
    const validDebris = raw.filter(d => d.tle1 && d.tle2);
    debrisData = validDebris.slice(0, PERFORMANCE_SETTINGS.CURRENT_COUNT);
    
    console.log(`Processing ${debrisData.length} debris objects`);

    // Clear existing objects
    debrisObjects.forEach(obj => {
      scene.remove(obj.mesh);
      obj.geometry.dispose();
      obj.material.dispose();
    });
    debrisObjects = [];
    
    countryColors.clear();
    companyColors.clear();

    const now = new Date();
    const quality = PERFORMANCE_SETTINGS[PERFORMANCE_SETTINGS.CURRENT_QUALITY];
    let validPositions = 0;

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

      const size = Math.random() < 0.1 ? Math.random() * 0.008 + 0.01 : Math.random() * 0.004 + 0.002;
      
      // Create unique geometry for each debris
      const geometry = createDebrisGeometry(size, quality);
      
      // Create material with color and texture
      const colorValue = getColorForCategory(
        currentColorMode === 'country' ? (sat.country || 'Unknown') : (sat.company || 'Unknown'),
        currentColorMode
      );
      
      const material = new THREE.MeshPhongMaterial({
        color: colorValue,
        map: debrisTexture,
        shininess: 30,
        specular: 0x444444
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position.x, position.y, position.z);
      
      // Add some random rotation
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      
      scene.add(mesh);
      
      debrisObjects.push({
        mesh,
        geometry,
        material,
        data: {
          ...sat,
          size: size * 1000, // Convert back to display size
          altitude,
          country: sat.country || 'Unknown',
          company: sat.company || 'Unknown'
        }
      });
    }

    const debrisCountEl = document.getElementById('debrisCount');
    if (debrisCountEl) debrisCountEl.textContent = debrisData.length;

    console.log(`Created ${validPositions} valid positions, ${debrisData.length - validPositions} fallback positions`);
    
  } catch (error) {
    console.error('Error loading debris:', error);
  } finally {
    isLoading = false;
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function updateColors(colorMode) {
  if (isLoading) return;
  
  console.log(`Updating colors by ${colorMode}`);
  currentColorMode = colorMode;

  debrisObjects.forEach(obj => {
    const colorValue = getColorForCategory(
      colorMode === 'country' ? obj.data.country : obj.data.company,
      colorMode
    );
    obj.material.color.setHex(colorValue);
  });

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

// Event listeners
document.getElementById('colorByCountry')?.addEventListener('click', () => updateColors('country'));
document.getElementById('colorByCompany')?.addEventListener('click', () => updateColors('company'));

document.getElementById('qualitySelect')?.addEventListener('change', (e) => {
  setQuality(e.target.value);
});

document.getElementById('countSelect')?.addEventListener('change', (e) => {
  setDebrisCount(e.target.value);
});

// Animation loop
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

function animate() {
  requestAnimationFrame(animate);
  
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (now - lastTime));
    const fpsEl = document.getElementById('fps');
    if (fpsEl) fpsEl.textContent = fps;
    frameCount = 0;
    lastTime = now;
  }

  // Rotate Earth
  earth.rotation.y += 0.001;
  atmosphere.rotation.y += 0.0008;
  
  // Rotate stars
  stars.rotation.y += 0.0001;
  
  // Rotate debris objects slightly
  debrisObjects.forEach((obj, index) => {
    if (index % 10 === 0) { // Only rotate every 10th object for performance
      obj.mesh.rotation.x += 0.001;
      obj.mesh.rotation.y += 0.002;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle window resize
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 100);
});