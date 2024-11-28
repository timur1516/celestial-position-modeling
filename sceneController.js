function updateScene() {
    switch (mode) {
        case viewModes.SUN_AROUND_EARTH:
            displaySunAroundEarth();
            displayHorizontalOrbit();
            displayHorizontalOrbitData();
            displayOnEarthPositionChooser();
            displayObserver();

            hideEclipticOrbit();
            hideEclipticOrbitData();
            break;
        case viewModes.EARTH_AROUND_SUN:
            displayEarthAroundSun();
            displayEclipticOrbit();
            displayEclipticOrbitData();

            hideHorizontalOrbit();
            hideHorizontalOrbitData();
            hideOnEarthPositionChooser();
            hideObserver();
            break;
    }
}

function updateStatistics() {
    document.getElementById("year").textContent = sun.T.getFullYear();
    document.getElementById("day").textContent = sun.T.getDate();
    document.getElementById("month").textContent = sun.T.toLocaleString('default', {month: 'short'}).replace('.', '').toUpperCase();
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

    sun.horizontalCoordinates;
    document.getElementById('xHorizontal').textContent = formatNumber(sun.xHorizontal);
    document.getElementById('yHorizontal').textContent = formatNumber(sun.yHorizontal);
    document.getElementById('zHorizontal').textContent = formatNumber(sun.zHorizontal);
    document.getElementById('azimuth').textContent = formatNumber(sun.azimuth);
    document.getElementById('altitude').textContent = formatNumber(sun.altitude);
}

function displaySunAroundEarth() {
    let p = sun.rectangularHorizontalCoordinates;
    earthSphere.position.set(0, 0, 0);
    sunSphere.position.set(p.x * 10, p.y * 10, p.z * 10);
}

function displayEarthAroundSun() {
    let p = sun.rectangularEclipticCoordinates;
    let pm = moon.rectangularEquatorialCoordinates;
    earthSphere.position.set(p.x * 10, p.y * 10, p.z * 10);
    console.log((pm.x + p.x) * 5, (pm.y + p.y) * 5, (pm.z + p.z) * 5);
    moonSphere.position.set((p.x*10 + pm.x*2), (p.y*10 + pm.y*2), (p.z*10 + pm.z));
    sunSphere.position.set(0, 0, 0);
}

function displayObserver() {
    scene.add(observerSphere);
    const x = Math.cos(sun.latitude * DEGRAD) * Math.cos(sun.longitude * DEGRAD);
    const y = Math.cos(sun.latitude * DEGRAD) * Math.sin(sun.longitude * DEGRAD);
    const z = Math.sin(sun.latitude * DEGRAD);
    observerSphere.position.set(x, y, z);
}

function displayHorizontalOrbitData() {
    document.querySelector('.horizontalOrbitData').style.display = 'flex';
}

function displayEclipticOrbitData() {
    document.querySelector('.eclipticOrbitData').style.display = 'flex';
}

function displayEclipticOrbit() {
    scene.remove(eclipticOrbit);
    eclipticOrbit = generateEclipticOrbit(sun);
    scene.add(eclipticOrbit);
}

function displayHorizontalOrbit() {
    scene.remove(horizontalOrbit);
    horizontalOrbit = generateHorizontalOrbit(sun);
    scene.add(horizontalOrbit);
}

function displayOnEarthPositionChooser() {
    document.querySelector('.positionChooser').style.display = 'flex';
}

function hideEclipticOrbitData() {
    document.querySelector('.eclipticOrbitData').style.display = 'none';
}

function hideHorizontalOrbitData() {
    document.querySelector('.horizontalOrbitData').style.display = 'none';
}

function hideOnEarthPositionChooser() {
    document.querySelector('.positionChooser').style.display = 'none';
}

function hideObserver() {
    scene.remove(observerSphere);
}

function hideEclipticOrbit() {
    scene.remove(eclipticOrbit);
}

function hideHorizontalOrbit() {
    scene.remove(horizontalOrbit);
}