const sun = new Sun();

let eclipticOrbit = generateEclipticOrbit(sun);
let horizontalOrbit = generateHorizontalOrbit(sun);

let speedK = 0;
let mode = viewModes.SUN_AROUND_EARTH;
let isAnimation = false;
let lastFrameTime = 0;

function animate() {
    requestAnimationFrame(animate);

    if (Date.now() - lastFrameTime < FRAME_INTERVAL) return;
    lastFrameTime = Date.now();

    if (isAnimation) {
        updateScene();
        updateStatistics();
        sun.T.setSeconds((sun.T.getSeconds() + speedK));
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

function toRealTime() {
    sun.T = new Date();
    sun.offset = -sun.T.getTimezoneOffset() / 60;
    timezoneSelect.value = sun.offset.toFixed(1);
    timeSpeedRange.value = 0;
    isAnimation = false;
    updateSpeedK();
    updateScene();
    updateStatistics();
}

function updateSpeedK() {
    switch (mode) {
        case viewModes.SUN_AROUND_EARTH:
            speedK = Number(timeSpeedRange.value) * ((60 * 60 * 24 * FRAME_INTERVAL) / (1000 * 400));

            break;
        case viewModes.EARTH_AROUND_SUN:
            speedK = Number(timeSpeedRange.value) * ((60 * 60 * 24 * 365 * FRAME_INTERVAL) / (1000 * 400));
            break;
    }
    document.getElementById("animationSpeed").textContent =
        (speedK < 0 ? "-" : "") + formatTime(1000 * Math.abs(speedK) / FRAME_INTERVAL) + "/сек";
}