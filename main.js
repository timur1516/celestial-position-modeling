THREE.Object3D.DefaultUp.set(0, 0, 1); // Z-axis up, and spinable

window.addEventListener('load', toRealTime);

const RADEG = (180.0 / Math.PI);
const DEGRAD = (Math.PI / 180.0);

const viewModes = Object.freeze({
    SUN_AROUND_EARTH: 0,
    EARTH_AROUND_SUN: 1,
});

let mode = viewModes.SUN_AROUND_EARTH;
let IS_ANIMATION = false;

const textureLoader = new THREE.TextureLoader();

// Инициализация сцены, камеры и рендера
const sceneTexture = textureLoader.load("2k_stars_milky_way.jpg");
const scene = new THREE.Scene();
scene.background = sceneTexture;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 1, window.innerHeight - 1);
document.body.appendChild(renderer.domElement);

// Оси координат (X: красный, Y: зеленый, Z: синий)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.rotateX(Math.PI / 2);
scene.add( gridHelper );

// Земля
const earthTexture = textureLoader.load("2k_earth_daymap.jpg");
const earthSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthSphereMaterial = new THREE.MeshBasicMaterial({map: earthTexture});
const earthSphere = new THREE.Mesh(earthSphereGeometry, earthSphereMaterial);
earthSphere.rotation.x = Math.PI / 2;
scene.add(earthSphere);

// Солнце
const sunTexture = textureLoader.load("2k_sun.jpg");
const sunSphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunSphereMaterial = new THREE.MeshBasicMaterial({map: sunTexture});
const sunSphere = new THREE.Mesh(sunSphereGeometry, sunSphereMaterial);
sunSphere.rotation.x = Math.PI / 2;
scene.add(sunSphere);

// Создание плоскости XY
// const planeSize = 50;
// const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
// const planeMaterial = new THREE.MeshBasicMaterial({
//     color: 0x0077ff,
//     side: THREE.DoubleSide,
//     transparent: true,
//     opacity: 0.3
// });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(plane);

// Устанавливаем положение камеры
camera.position.z = 10;
camera.position.x = 5;
camera.position.y = 5;

// Добавляем OrbitControls для управления камерой
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Добавляем плавность движений
controls.dampingFactor = 0.05; // Коэффициент демпфирования
controls.enablePan = false;

let sun = new Sun();

let speedK = 0;

let fps = 100; // Частота кадров по умолчанию (60 FPS)
let frameInterval = 1000 / fps; // Интервал времени между кадрами в миллисекундах
let lastFrameTime = 0; // Время последнего кадра

// Анимация
function animate() {
    requestAnimationFrame(animate);
    if (Date.now() - lastFrameTime < frameInterval) return;
    lastFrameTime = Date.now();

    if (IS_ANIMATION) redrawObjects();

    // Обновляем контроллер камеры в каждом кадре
    controls.update();
    renderer.render(scene, camera);
}

animate();

function redrawObjects() {
    switch (mode) {
        case viewModes.SUN_AROUND_EARTH:
            displaySunAroundEarth();
            break;
        case viewModes.EARTH_AROUND_SUN:
            displayEarthAroundSun();
            break;
    }
    updateStatistics();
}

function displaySunAroundEarth() {
    let p = sun.rectangularHorizontalCoordinates;
    earthSphere.position.set(0, 0, 0);
    sunSphere.position.set(p.x * 10, p.y * 10, p.z * 10);
    sun.T.setSeconds((sun.T.getSeconds() + speedK));
}

function displayEarthAroundSun() {
    let p = sun.rectangularEclipticCoordinates;
    earthSphere.position.set(p.x * 10, p.y * 10, p.z * 10)
    sunSphere.position.set(0, 0, 0);
    sun.T.setSeconds((sun.T.getSeconds() + speedK));
}

function updateStatistics() {
    console.log(sun.T.getYear());
    document.getElementById("year").textContent = sun.T.getFullYear();
    document.getElementById("day").textContent = sun.T.getDate();
    document.getElementById("month").textContent = sun.T.toLocaleString('default', { month: 'short' }).slice(0, -1).toUpperCase();
    document.getElementById("time").textContent = sun.T.toLocaleString().slice(12, 17);
}

document.getElementsByName("modeRadio").forEach(modeRadio => {
    modeRadio.addEventListener("change", function () {
        mode = Number(modeRadio.value);
        updateSpeedK();
        redrawObjects();
    })
});

function formatTime(seconds) {
    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;

    if (seconds < secondsInHour) {
        // Форматируем в минуты
        let minutes = seconds / secondsInMinute;
        return minutes.toFixed(2) + " минут";
    }
    if (seconds < secondsInDay) {
        // Форматируем в часы
        let hours = seconds / secondsInHour;
        return hours.toFixed(2) + " часов";
    }
    // Форматируем в дни
    let days = seconds / secondsInDay;
    return days.toFixed(2) + " дней";
}

const range = document.getElementById("speedRange");

range.addEventListener("input", () => {
    updateSpeedK();
    IS_ANIMATION = true;
});

function updateSpeedK(){
    switch (mode) {
        case viewModes.SUN_AROUND_EARTH:
            speedK = Number(range.value) * ((60*60*24*frameInterval)/(1000*400));

            break;
        case viewModes.EARTH_AROUND_SUN:
            speedK = Number(range.value) * ((60*60*24*365*frameInterval)/(1000*400));
            break;
    }
    document.getElementById("animationSpeed").textContent =
        (speedK < 0 ? "-" : "") + formatTime(1000 * Math.abs(speedK) / frameInterval) + "/сек";
}

document.getElementById("toRealTimeButton").addEventListener("click", toRealTime);

function toRealTime(){
    sun.T = new Date();
    range.value = 0;
    IS_ANIMATION = false;
    updateSpeedK();
    redrawObjects();
}

document.getElementById("startAnimation").addEventListener("click", function () {
    if(IS_ANIMATION) return;
    IS_ANIMATION = true;
    range.value = 50;
    updateSpeedK();
});

document.getElementById("pauseAnimation").addEventListener("click", function () {
    IS_ANIMATION = false;
});

// Обновление размера рендера при изменении размера окна
window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth - 1, window.innerHeight - 1);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});