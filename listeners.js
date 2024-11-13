const timeSpeedRange = document.getElementById("speedRange");
const longitudeRange = document.getElementById("lon");
const latitudeRange = document.getElementById("lat");
const timezoneSelect = document.getElementById("timezone");

window.addEventListener('load', toRealTime);

document.getElementsByName("modeRadio").forEach(modeRadio => {
    modeRadio.addEventListener("change", function () {
        mode = Number(modeRadio.value);
        updateSpeedK();
        updateScene();
    })
});

timeSpeedRange.addEventListener("input", () => {
    updateSpeedK();
    isAnimation = true;
});

longitudeRange.addEventListener("input", () => {
    sun.longitude = longitudeRange.value;
    document.getElementById('lonValue').textContent = longitudeRange.value + '°';
    displaySunAroundEarth();
});

document.getElementById("lat").addEventListener("input", () => {
    sun.latitude = latitudeRange.value;
    document.getElementById('latValue').textContent = latitudeRange.value + '°';
    displaySunAroundEarth();
});

timezoneSelect.addEventListener("change", () => {
    sun.offset = timezoneSelect.value;
    displaySunAroundEarth();
});

document.getElementById("toRealTimeButton").addEventListener("click", toRealTime);

document.getElementById("startAnimation").addEventListener("click", () => {
    if (isAnimation) return;
    isAnimation = true;
    timeSpeedRange.value = 50;
    updateSpeedK();
});

document.getElementById("pauseAnimation").addEventListener("click", () => {
    isAnimation = false;
});

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth - 1, window.innerHeight - 1);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});