const RADEG = (180.0 / Math.PI);
const DEGRAD = (Math.PI / 180.0);

let WIDTH = window.innerWidth - 1;
let HEIGHT = window.innerHeight - 1;

THREE.Object3D.DefaultUp.set(0, 0, 1); // Z-axis up, and spinable

// Инициализация сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT - 1);
document.body.appendChild(renderer.domElement);

// Оси координат (X: красный, Y: зеленый, Z: синий)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Устанавливаем положение камеры
camera.position.z = 5;
camera.position.x = 5;
camera.position.y = 5;

// Добавляем OrbitControls для управления камерой
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Добавляем плавность движений
controls.dampingFactor = 0.05; // Коэффициент демпфирования
controls.enablePan = false;

// Небесная сфера
const sphereGeometry = new THREE.SphereGeometry(10, 64, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x0077ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1,
    wireframe: true
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// let g = new THREE.BufferGeometry().setFromPoints(
//     new THREE.Path().absarc(0, 0, 10, 0, Math.PI * 2).getSpacedPoints(50)
// );
// let m = new THREE.LineBasicMaterial({color: "aqua"});
// let l1 = new THREE.Line(g, m);
// let l2 = new THREE.Line(g, m);
// l1.rotateY(-23.4 * DEGRAD);
// scene.add(l1);
// scene.add(l2);

let sun = new Sun();
sun.T = new Date('2024-01-01T00:00:00');
sun.offset = 3;

let points = [];
for(let i = 0; i < 366; i++){
    let coordinates = sun.rectangularEquatorialCoordinates;
    points.push( new THREE.Vector3(coordinates.x * 10, coordinates.y * 10, coordinates.z * 10) );
    sun.T.setDate(sun.T.getDate() + 1);
}
let material = new THREE.LineBasicMaterial({color: 0x00FF00});
let geometry = new THREE.BufferGeometry().setFromPoints(points);
line1 = new THREE.Line( geometry, material );
scene.add(line1);

points = [];
for(let i = 0; i < 366; i++){
    let coordinates = sun.rectangularEclipticCoordinates;
    points.push( new THREE.Vector3(coordinates.x * 10, coordinates.y * 10, coordinates.z * 10) );
    sun.T.setDate(sun.T.getDate() + 1);
}
material = new THREE.LineBasicMaterial({color: 0xFF0000});
geometry = new THREE.BufferGeometry().setFromPoints(points);
let line2 = new THREE.Line( geometry, material );
scene.add(line2);

let line3;

// Анимация
function animate() {
    requestAnimationFrame(animate);

    sun.T = new Date('2024-01-01T00:00:00');

    sun.longitude = document.getElementById("lon").value;
    sun.latitude = document.getElementById("lat").value;

    points = [];
    for (let i = 0; i < 24 * 60; i++) {
        let coordinates = sun.rectangularHorizontalCoordinates;
        points.push(new THREE.Vector3(coordinates.x * 5, coordinates.y * 5, coordinates.z * 5));
        sun.T.setMinutes(sun.T.getMinutes() + 1);
    }
    material = new THREE.LineBasicMaterial({color: 0x0000FF});
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    scene.remove(line3);
    line3 = new THREE.Line(geometry, material);
    scene.add(line3);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Обновление размера рендера при изменении размера окна
window.addEventListener('resize', function () {
    WIDTH = window.innerWidth - 1;
    HEIGHT = window.innerHeight - 1;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});