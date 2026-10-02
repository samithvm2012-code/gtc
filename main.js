// 1. Scene, Camera, Renderer Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
scene.add(dirLight);

// 3. Ground / City Floor
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark asphalt color
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 4. Procedural Buildings (Simple City Environment)
const buildingMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
for (let i = 0; i < 40; i++) {
    const width = 5 + Math.random() * 5;
    const height = 10 + Math.random() * 30;
    const depth = 5 + Math.random() * 5;

    const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), buildingMat);
    
    // Position buildings around the city grid
    building.position.x = (Math.random() - 0.5) * 160;
    building.position.z = (Math.random() - 0.5) * 160;
    building.position.y = height / 2;
    
    // Keep spawn area clear
    if (Math.abs(building.position.x) > 10 || Math.abs(building.position.z) > 10) {
        scene.add(building);
    }
}

// 5. Player Setup
const playerGeo = new THREE.BoxGeometry(1, 2, 1);
const playerMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 }); // Green placeholder character
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0, 1, 0);
scene.add(player);

// 6. Movement Controls Setup
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Camera Offset for Third-Person Perspective
const cameraOffset = new THREE.Vector3(0, 5, 10);

// 7. Main Game Loop
function animate() {
    requestAnimationFrame(animate);

    const speed = 0.15;
    
    if (keys['w']) player.position.z -= speed;
    if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed;
    if (keys['d']) player.position.x += speed;

    // Follow character with third-person camera
    camera.position.x = player.position.x + cameraOffset.x;
    camera.position.y = player.position.y + cameraOffset.y;
    camera.position.z = player.position.z + cameraOffset.z;
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
