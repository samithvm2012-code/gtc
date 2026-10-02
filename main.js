// 1. Scene & Camera Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Bright Indian daylight sky
scene.fog = new THREE.FogExp2(0x87ceeb, 0.008);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfffaed, 1.0);
sunLight.position.set(50, 80, 50);
sunLight.castShadow = true;
scene.add(sunLight);

// 3. Ground, Roads & Sidewalks
const worldSize = 300;

// Base Grass Ground
const grassMat = new THREE.MeshLambertMaterial({ color: 0x4a7c59 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(worldSize, worldSize), grassMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Main Asphalt Road Network
const roadMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
const roadH = new THREE.Mesh(new THREE.PlaneGeometry(worldSize, 20), roadMat);
roadH.rotation.x = -Math.PI / 2;
roadH.position.y = 0.01;
scene.add(roadH);

const roadV = new THREE.Mesh(new THREE.PlaneGeometry(20, worldSize), roadMat);
roadV.rotation.x = -Math.PI / 2;
roadV.position.y = 0.01;
scene.add(roadV);

// Road Center Yellow Lines
const lineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
for (let i = -140; i < 140; i += 10) {
    const lineH = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.4), lineMat);
    lineH.rotation.x = -Math.PI / 2;
    lineH.position.set(i, 0.02, 0);
    scene.add(lineH);

    const lineV = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 4), lineMat);
    lineV.rotation.x = -Math.PI / 2;
    lineV.position.set(0, 0.02, i);
    scene.add(lineV);
}

// 4. Indian Trees (Coconut Palms & Lush Trees)
function createTree(x, z) {
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 6),
        new THREE.MeshLambertMaterial({ color: 0x5a3d28 })
    );
    trunk.position.set(x, 3, z);
    scene.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(3, 6, 6),
        new THREE.MeshLambertMaterial({ color: 0x2e6f40 })
    );
    leaves.position.set(x, 7, z);
    scene.add(leaves);
}

for (let i = -120; i <= 120; i += 30) {
    if (Math.abs(i) > 15) {
        createTree(i, 13);
        createTree(i, -13);
        createTree(13, i);
        createTree(-13, i);
    }
}

// 5. Buildings
const buildingMat = new THREE.MeshLambertMaterial({ color: 0xddcbb3 }); // Light terracotta / cement tint
for (let i = 0; i < 30; i++) {
    const width = 10 + Math.random() * 8;
    const height = 12 + Math.random() * 20;
    const depth = 10 + Math.random() * 8;

    const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), buildingMat);
    
    // Position outside main roads
    let x = (Math.random() - 0.5) * 220;
    let z = (Math.random() - 0.5) * 220;
    if (Math.abs(x) < 20) x += 30 * Math.sign(x || 1);
    if (Math.abs(z) < 20) z += 30 * Math.sign(z || 1);

    building.position.set(x, height / 2, z);
    scene.add(building);
}

// 6. Player Setup
const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshLambertMaterial({ color: 0x228be6 })
);
player.position.set(0, 1, 5);
scene.add(player);

// 7. Auto Rickshaw (Indian Tuk-Tuk)
const autoGroup = new THREE.Group();

// Yellow Top
const autoTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.2, 2.8),
    new THREE.MeshLambertMaterial({ color: 0xffcc00 })
);
autoTop.position.y = 1.3;
autoGroup.add(autoTop);

// Black Bottom Body
const autoBottom = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.8, 2.8),
    new THREE.MeshLambertMaterial({ color: 0x111111 })
);
autoBottom.position.y = 0.4;
autoGroup.add(autoBottom);

autoGroup.position.set(6, 0, 0);
scene.add(autoGroup);

// Game State
let inCar = false;
let autoSpeed = 0;
let autoAngle = 0;
let yaw = 0;
let pitch = 0.3;

// Mouse Controls
document.body.addEventListener('click', () => document.body.requestPointerLock());
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * 0.003;
        pitch -= e.movementY * 0.003;
        pitch = Math.max(0.1, Math.min(Math.PI / 2.5, pitch));
    }
});

// Key Controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'f') {
        const dist = player.position.distanceTo(autoGroup.position);
        if (!inCar && dist < 4) {
            inCar = true;
            player.visible = false;
        } else if (inCar) {
            inCar = false;
            player.visible = true;
            player.position.set(autoGroup.position.x + 2.5, 1, autoGroup.position.z);
        }
    }
});
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Game Loop
function animate() {
    requestAnimationFrame(animate);

    if (!inCar) {
        const moveSpeed = 0.14;
        const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
        const side = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

        if (keys['w']) player.position.addScaledVector(forward, moveSpeed);
        if (keys['s']) player.position.addScaledVector(forward, -moveSpeed);
        if (keys['d']) player.position.addScaledVector(side, moveSpeed);
        if (keys['a']) player.position.addScaledVector(side, -moveSpeed);

        player.rotation.y = yaw;

        const camDist = 8;
        camera.position.x = player.position.x + camDist * Math.sin(yaw) * Math.cos(pitch);
        camera.position.y = player.position.y + camDist * Math.sin(pitch) + 1;
        camera.position.z = player.position.z + camDist * Math.cos(yaw) * Math.cos(pitch);
        camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
    } else {
        if (keys['w']) autoSpeed = Math.min(autoSpeed + 0.015, 0.45);
        else if (keys['s']) autoSpeed = Math.max(autoSpeed - 0.015, -0.2);
        else autoSpeed *= 0.96;

        if (Math.abs(autoSpeed) > 0.01) {
            const dir = autoSpeed > 0 ? 1 : -1;
            if (keys['a']) autoAngle += 0.035 * dir;
            if (keys['d']) autoAngle -= 0.035 * dir;
        }

        autoGroup.rotation.y = autoAngle;
        autoGroup.position.x -= Math.sin(autoAngle) * autoSpeed;
        autoGroup.position.z -= Math.cos(autoAngle) * autoSpeed;

        const camDist = 10;
        camera.position.x = autoGroup.position.x + camDist * Math.sin(yaw) * Math.cos(pitch);
        camera.position.y = autoGroup.position.y + camDist * Math.sin(pitch) + 2;
        camera.position.z = autoGroup.position.z + camDist * Math.cos(yaw) * Math.cos(pitch);
        camera.lookAt(autoGroup.position.x, autoGroup.position.y + 1, autoGroup.position.z);
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
