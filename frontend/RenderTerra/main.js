// Scene, Camera, Renderer
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls (mouse drag to move around)
const controls = new OrbitControls(camera, renderer.domElement);

// Lighting
const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(10, 10, 10);
scene.add(light);

// Earth geometry and texture
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthTexture = new THREE.TextureLoader().load('./resources/textures/earth.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Create surrounding spheres
const spheres = [];
for (let i = 0; i < 5; i++) {
  const geometry = new THREE.SphereGeometry(0.2, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(geometry, material);

  const angle = i * (Math.PI * 2 / 5);
  sphere.position.set(Math.cos(angle) * 3, 0, Math.sin(angle) * 3);

  scene.add(sphere);
  spheres.push(sphere);
}

// Camera position
camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  earth.rotation.y += 0.001; // Earth rotation

  spheres.forEach((s, i) => {
    const angle = performance.now() * 0.001 + i;
    s.position.x = Math.cos(angle) * 3;
    s.position.z = Math.sin(angle) * 3;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
