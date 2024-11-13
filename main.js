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

let eclipticOrbit = generateEclipticOrbit();

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
    scene.remove(eclipticOrbit);
    document.querySelector('.eclipticOrbitData').style.display = 'none';
    document.querySelector('.horizontalOrbitData').style.display = 'flex';
    let p = sun.rectangularHorizontalCoordinates;
    sun.horizontalCoordinates;
    earthSphere.position.set(0, 0, 0);
    sunSphere.position.set(p.x * 10, p.y * 10, p.z * 10);
    sun.T.setSeconds((sun.T.getSeconds() + speedK));
}

function displayEarthAroundSun() {
    scene.add(eclipticOrbit);
    document.querySelector('.eclipticOrbitData').style.display = 'flex';
    document.querySelector('.horizontalOrbitData').style.display = 'none';
    let p = sun.rectangularEclipticCoordinates;
    earthSphere.position.set(p.x * 10, p.y * 10, p.z * 10)
    sunSphere.position.set(0, 0, 0);
    sun.T.setSeconds((sun.T.getSeconds() + speedK));
}

function formatNumber(value) {
    return value !== undefined ? value.toFixed(2) : "N/A";
}

function updateStatistics() {
    document.getElementById("year").textContent = sun.T.getFullYear();
    document.getElementById("day").textContent = sun.T.getDate();
    document.getElementById("month").textContent = sun.T.toLocaleString('default', { month: 'short' }).slice(0, -1).toUpperCase();
    document.getElementById("time").textContent = sun.T.toLocaleString().slice(12, 17);

    document.getElementById('days').textContent = formatNumber(sun.d);
    document.getElementById('longitude').textContent = formatNumber(sun.w);
    document.getElementById('distance').textContent = formatNumber(sun.a);
    document.getElementById('eccentricity').textContent = formatNumber(sun.e);
    document.getElementById('meanAnomaly').textContent = formatNumber(sun.M);
    document.getElementById('inclination').textContent = formatNumber(sun.oblecl);
    document.getElementById('meanLongitude').textContent = formatNumber(sun.L);
    document.getElementById('eccentricAnomaly').textContent = formatNumber(sun.E);

    document.getElementById('xInPlaneOfEcliptic').textContent = formatNumber(sun.xInPlaneOfEcliptic);
    document.getElementById('yInPlaneOfEcliptic').textContent = formatNumber(sun.yInPlaneOfEcliptic);
    document.getElementById('helioDistance').textContent = formatNumber(sun.r);
    document.getElementById('eclipticLongitude').textContent = formatNumber(sun.lon);
    document.getElementById('trueAnomaly').textContent = formatNumber(sun.v);

    document.getElementById('xHorizontal').textContent = formatNumber(sun.xHorizontal);
    document.getElementById('yHorizontal').textContent = formatNumber(sun.yHorizontal);
    document.getElementById('zHorizontal').textContent = formatNumber(sun.zHorizontal);
    document.getElementById('azimuth').textContent = formatNumber(sun.azimuth);
    document.getElementById('altitude').textContent = formatNumber(sun.altitude);
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
    const secondsInHour = 60 * 60;
    const secondsInDay = 60 * 60 * 24;
    const secondsInMonth = 60 * 60 * 24 * 30;
    const secondsInYear = 60 * 60 * 24 * 365;

    if (seconds < secondsInHour) {
        let minutes = seconds / secondsInMinute;
        return minutes.toFixed(2) + " минут";
    }
    if (seconds < secondsInDay) {
        let hours = seconds / secondsInHour;
        return hours.toFixed(2) + " часов";
    }
    if (seconds < secondsInMonth) {
        let days = seconds / secondsInDay;
        return days.toFixed(2) + " дней";
    }
    if (seconds < secondsInYear) {
        let months = seconds / secondsInMonth;
        return months.toFixed(2) + " месяцев";
    }
    let years = seconds / secondsInYear;
    return years.toFixed(2) + " лет";
}

const range = document.getElementById("speedRange");

range.addEventListener("input", () => {
    updateSpeedK();
    IS_ANIMATION = true;
});

function generateEclipticOrbit() {
    let eclipticOrbitPoints = [];
    for (let i = 0; i < 367; i++) {
        let coordinates = sun.rectangularEclipticCoordinates;
        eclipticOrbitPoints.push(new THREE.Vector3(coordinates.x * 10, coordinates.y * 10, coordinates.z * 10));
        sun.T.setDate(sun.T.getDate() + 1);
    }
    material = new THREE.LineBasicMaterial({color: 0xFF0000});
    geometry = new THREE.BufferGeometry().setFromPoints(eclipticOrbitPoints);
    return new THREE.Line(geometry, material);
}

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