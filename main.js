// 1. Scene & Camera Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

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
const groundMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 4. Procedural Buildings
const buildingMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
for (let i = 0; i < 35; i++) {
    const width = 6 + Math.random() * 6;
    const height = 12 + Math.random() * 25;
    const depth = 6 + Math.random() * 6;

    const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), buildingMat);
    building.position.x = (Math.random() - 0.5) * 160;
    building.position.z = (Math.random() - 0.5) * 160;
    building.position.y = height / 2;
    
    // Clear spawn center
    if (Math.abs(building.position.x) > 12 || Math.abs(building.position.z) > 12) {
        scene.add(building);
    }
}

// 5. Player Setup (Green Character)
const playerGeo = new THREE.BoxGeometry(1, 2, 1);
const playerMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0, 1, 0);
scene.add(player);

// 6. Car Setup (Red Drivable Vehicle)
const carGroup = new THREE.Group();

// Car body
const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.2, 4),
    new THREE.MeshLambertMaterial({ color: 0xff1111 })
);
carBody.position.y = 0.8;
carGroup.add(carBody);

// Car cabin
const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.8, 2),
    new THREE.MeshLambertMaterial({ color: 0x222222 })
);
cabin.position.set(0, 1.6, -0.2);
carGroup.add(cabin);

carGroup.position.set(5, 0, -5);
scene.add(carGroup);

// Game State Variables
let inCar = false;
let carSpeed = 0;
let carAngle = 0;

// Mouse Camera Rotation Variables
let yaw = 0;
let pitch = 0.3;

document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * 0.003;
        pitch -= e.movementY * 0.003;
        pitch = Math.max(0.1, Math.min(Math.PI / 2.5, pitch)); // Clamp camera height
    }
});

// Controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Press 'F' to enter / exit vehicle
    if (e.key.toLowerCase() === 'f') {
        const dist = player.position.distanceTo(carGroup.position);
        if (!inCar && dist < 4) {
            inCar = true;
            player.visible = false;
        } else if (inCar) {
            inCar = false;
            player.visible = true;
            player.position.set(carGroup.position.x + 2.5, 1, carGroup.position.z);
        }
    }
});

window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Main Game Loop
function animate() {
    requestAnimationFrame(animate);

    if (!inCar) {
        // Character Movement relative to camera angle
        const moveSpeed = 0.12;
        const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
        const side = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

        if (keys['w']) player.position.addScaledVector(forward, moveSpeed);
        if (keys['s']) player.position.addScaledVector(forward, -moveSpeed);
        if (keys['d']) player.position.addScaledVector(side, moveSpeed);
        if (keys['a']) player.position.addScaledVector(side, -moveSpeed);

        player.rotation.y = yaw;

        // Camera follow player
        const camDist = 8;
        camera.position.x = player.position.x + camDist * Math.sin(yaw) * Math.cos(pitch);
        camera.position.y = player.position.y + camDist * Math.sin(pitch) + 1;
        camera.position.z = player.position.z + camDist * Math.cos(yaw) * Math.cos(pitch);
        camera.lookAt(player.position.x, player.position.y + 1, player.position.z);

    } else {
        // Vehicle Driving Logic
        if (keys['w']) carSpeed = Math.min(carSpeed + 0.015, 0.4);
        else if (keys['s']) carSpeed = Math.max(carSpeed - 0.015, -0.2);
        else carSpeed *= 0.96; // Friction deceleration

        if (Math.abs(carSpeed) > 0.01) {
            const dir = carSpeed > 0 ? 1 : -1;
            if (keys['a']) carAngle += 0.03 * dir;
            if (keys['d']) carAngle -= 0.03 * dir;
        }

        carGroup.rotation.y = carAngle;
        carGroup.position.x -= Math.sin(carAngle) * carSpeed;
        carGroup.position.z -= Math.cos(carAngle) * carSpeed;

        // Camera follow car
        const camDist = 12;
        camera.position.x = carGroup.position.x + camDist * Math.sin(yaw) * Math.cos(pitch);
        camera.position.y = carGroup.position.y + camDist * Math.sin(pitch) + 2;
        camera.position.z = carGroup.position.z + camDist * Math.cos(yaw) * Math.cos(pitch);
        camera.lookAt(carGroup.position.x, carGroup.position.y + 1, carGroup.position.z);
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
