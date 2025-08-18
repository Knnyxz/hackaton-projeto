import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as satellite from 'https://cdn.jsdelivr.net/npm/satellite.js@6.0.1/dist/satellite.min.js';

// Constants
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_THREEJS = 1;
const KM_TO_THREEJS = EARTH_RADIUS_THREEJS / EARTH_RADIUS_KM;

// Performance settings - adjust these to balance quality vs performance
const PERFORMANCE_SETTINGS = {
  // Geometry quality levels (segments/detail)
  LOW_QUALITY: { segments: 4, detail: 4 },      // Very fast, blocky
  MEDIUM_QUALITY: { segments: 6, detail: 6 },   // Balanced
  HIGH_QUALITY: { segments: 8, detail: 8 },     // Smooth, slower
  
  // Current quality setting
  CURRENT_QUALITY: 'MEDIUM_QUALITY',
  
  // Current debris count
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
document.body.appendChild(renderer.domElement);

// Use original OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
camera.position.set(5, 3, 5);

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Earth with better appearance
const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS_THREEJS, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({ 
  color: 0x2244aa,
  shininess: 30,
  specular: 0x222222
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
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

// Enhanced color schemes with better variety
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

let debrisData = [];
let debrisMeshes = [];
let currentColorMode = 'country';
let isLoading = false;

async function loadDebris() {
  if (isLoading) return;
  isLoading = true;
  
  // Show loading indicator
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'block';
  
  try {
    console.log('Loading debris data...');
    const res = await fetch('http://localhost:3000/space_debris');
    const raw = await res.json();
    
    // Filter and limit data based on current settings
    const validDebris = raw.filter(d => d.tle1 && d.tle2);
    debrisData = validDebris.slice(0, PERFORMANCE_SETTINGS.CURRENT_COUNT);
    
    console.log(`Processing ${debrisData.length} debris objects`);

    // Clear existing meshes
    debrisMeshes.forEach(mesh => scene.remove(mesh));
    debrisMeshes = [];
    
    // Clear color maps to regenerate colors
    countryColors.clear();
    companyColors.clear();

    // Process satellite positions
    const now = new Date();
    const processedDebris = [];
    let validPositions = 0;

    for (let i = 0; i < debrisData.length; i++) {
      const sat = debrisData[i];
      let position, size;
      
      try {
        const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
        const posVel = satellite.propagate(satrec, now);
        
        if (posVel.position && typeof posVel.position.x === 'number') {
          const gmst = satellite.gstime(now);
          const geodetic = satellite.eciToGeodetic(posVel.position, gmst);
          
          const lat = geodetic.latitude * 180 / Math.PI;
          const lon = geodetic.longitude * 180 / Math.PI;
          const alt = Math.max(geodetic.height, 300); // Minimum 300km
          
          if (!isNaN(lat) && !isNaN(lon) && !isNaN(alt) && 
              lat >= -90 && lat <= 90 && alt > 0) {
            position = geodeticToThreeJS(lat, lon, alt);
            validPositions++;
          }
        }
      } catch (error) {
        // Skip invalid entries
      }
      
      // Fallback for invalid data
      if (!position) {
        const alt = 300 + Math.random() * 1000;
        const lat = (Math.random() - 0.5) * 180;
        const lon = (Math.random() - 0.5) * 360;
        position = geodeticToThreeJS(lat, lon, alt);
      }

      // Determine size category (small debris vs large satellites)
      size = Math.random() < 0.1 ? Math.random() * 10 + 5 : Math.random() * 2 + 0.1;

      processedDebris.push({
        ...sat,
        position,
        size,
        country: sat.country || 'Unknown',
        company: sat.company || 'Unknown'
      });
    }

    // Create instanced meshes for different size categories with current quality
    const quality = PERFORMANCE_SETTINGS[PERFORMANCE_SETTINGS.CURRENT_QUALITY];
    const sizeCategories = [
      { 
        min: 0, 
        max: 1, 
        geometry: new THREE.SphereGeometry(0.005, quality.segments, quality.detail),
        name: 'tiny'
      },
      { 
        min: 1, 
        max: 3, 
        geometry: new THREE.SphereGeometry(0.01, quality.segments, quality.detail),
        name: 'small'
      },
      { 
        min: 3, 
        max: 10, 
        geometry: new THREE.SphereGeometry(0.02, quality.segments + 2, quality.detail + 2),
        name: 'medium'
      },
      { 
        min: 10, 
        max: Infinity, 
        geometry: new THREE.SphereGeometry(0.04, quality.segments + 4, quality.detail + 4),
        name: 'large'
      }
    ];

    sizeCategories.forEach(category => {
      const objectsInCategory = processedDebris.filter(d => d.size >= category.min && d.size < category.max);
      if (objectsInCategory.length === 0) return;

      const material = new THREE.MeshPhongMaterial({ vertexColors: true });
      const mesh = new THREE.InstancedMesh(category.geometry, material, objectsInCategory.length);

      const dummy = new THREE.Object3D();
      const colorArray = new Float32Array(objectsInCategory.length * 3);

      objectsInCategory.forEach((obj, i) => {
        dummy.position.set(obj.position.x, obj.position.y, obj.position.z);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Set color based on current mode
        const colorValue = getColorForCategory(
          currentColorMode === 'country' ? obj.country : obj.company,
          currentColorMode
        );
        const color = new THREE.Color(colorValue);
        colorArray.set([color.r, color.g, color.b], i * 3);
      });

      mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
      mesh.userData = { objects: objectsInCategory, category: category };
      scene.add(mesh);
      debrisMeshes.push(mesh);
      
      console.log(`Created ${category.name} category with ${objectsInCategory.length} objects`);
    });

    // Update UI
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

  debrisMeshes.forEach(mesh => {
    const objects = mesh.userData.objects;
    const colorArray = new Float32Array(objects.length * 3);

    objects.forEach((obj, i) => {
      const colorValue = getColorForCategory(
        colorMode === 'country' ? obj.country : obj.company,
        colorMode
      );
      const color = new THREE.Color(colorValue);
      colorArray.set([color.r, color.g, color.b], i * 3);
    });

    mesh.instanceColor.array = colorArray;
    mesh.instanceColor.needsUpdate = true;
  });

  // Update button states
  document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
  const activeButton = document.getElementById(`colorBy${colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}`);
  if (activeButton) activeButton.classList.add('active');
}

function setQuality(qualityLevel) {
  console.log(`Setting quality to ${qualityLevel}`);
  PERFORMANCE_SETTINGS.CURRENT_QUALITY = qualityLevel;
  loadDebris(); // Reload with new quality
}

function setDebrisCount(count) {
  console.log(`Setting debris count to ${count}`);
  PERFORMANCE_SETTINGS.CURRENT_COUNT = parseInt(count);
  loadDebris(); // Reload with new count
}

// Initialize
loadDebris();

// Event listeners
document.getElementById('colorByCountry')?.addEventListener('click', () => updateColors('country'));
document.getElementById('colorByCompany')?.addEventListener('click', () => updateColors('company'));

// Quality and count controls
document.getElementById('qualitySelect')?.addEventListener('change', (e) => {
  setQuality(e.target.value);
});

document.getElementById('countSelect')?.addEventListener('change', (e) => {
  setDebrisCount(e.target.value);
});

// Animation loop with FPS monitoring
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

function animate() {
  requestAnimationFrame(animate);
  
  // Update FPS
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) { // Update every second
    fps = Math.round((frameCount * 1000) / (now - lastTime));
    const fpsEl = document.getElementById('fps');
    if (fpsEl) fpsEl.textContent = fps;
    frameCount = 0;
    lastTime = now;
  }

  // Rotate Earth
  earth.rotation.y += 0.001;
  atmosphere.rotation.y += 0.0008;
  
  // Rotate stars slowly
  stars.rotation.y += 0.0001;

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