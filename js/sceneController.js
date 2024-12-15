function updateScene() {
    switch (mode) {
        case viewModes.SUN_AROUND_EARTH:
            displaySunAroundEarth();
            displayHorizontalOrbit();
            displaySunOrbitData();
            displayOnEarthPositionChooser();
            displayObserver();

            hideEclipticOrbit();
            hideEarthOrbitData();
            hideMoon();
            hideMoonOrbitData();
            break;
        case viewModes.EARTH_AROUND_SUN:
            displayEarthAroundSun();
            displayEclipticOrbit();
            displayEarthOrbitData();
            displayMoonOrbitData();

            hideHorizontalOrbit();
            hideSunOrbitData();
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

    document.getElementById('earth-x-ecliptic').textContent = formatNumber(sun.xEcliptic) + ' a.е';
    document.getElementById('earth-y-ecliptic').textContent = formatNumber(sun.yEcliptic) + ' a.е';
    document.getElementById('earth-z-ecliptic').textContent = formatNumber(sun.zEcliptic) + ' a.е';
    document.getElementById('earth-true-anomaly').textContent = formatNumber(sun.v) + ' рад';
    document.getElementById('earth-r').textContent = formatNumber(sun.r) + ' a.е';

    moon.rectangularEclipticCoordinates;
    document.getElementById('moon-x-ecliptic').textContent = formatNumber(moon.xEcliptic) + ' км';
    document.getElementById('moon-y-ecliptic').textContent = formatNumber(moon.yEcliptic) + ' км';
    document.getElementById('moon-z-ecliptic').textContent = formatNumber(moon.zEcliptic) + ' км';
    document.getElementById('moon-true-anomaly').textContent = formatNumber(moon.v) + ' рад';
    document.getElementById('moon-r').textContent = formatNumber(moon.r) + ' км';

    sun.rectangularHorizontalCoordinates;
    document.getElementById('sun-true-anomaly').textContent = formatNumber(sun.v) + ' рад';
    document.getElementById('sun-r').textContent = formatNumber(sun.r) + ' a.е';
    document.getElementById('sun-ra').textContent = formatNumber(sun.RA) + ' рад';
    document.getElementById('sun-decl').textContent = formatNumber(sun.Decl) + ' рад';
    document.getElementById('sun-azimuth').textContent = formatNumber(sun.azimuth) + ' рад';
    document.getElementById('sun-altitude').textContent = formatNumber(sun.altitude) + ' рад';
}

function displaySunAroundEarth() {
    let p = sun.rectangularHorizontalCoordinates;
    earthSphere.position.set(0, 0, 0);
    sunSphere.position.set(p.x * 10, p.y * 10, p.z * 10);
    scene.add(sunSphere);
    scene.add(earthSphere);
}

function displayEarthAroundSun() {
    let p = sun.rectangularEclipticCoordinates;
    let pm = moon.rectangularEclipticCoordinates;
    earthSphere.position.set(p.x * 10, p.y * 10, p.z * 10);
    moonSphere.position.set((p.x * 10 + pm.x * 2), (p.y * 10 + pm.y * 2), (p.z * 10 + pm.z));
    sunSphere.position.set(0, 0, 0);
    scene.add(sunSphere);
    scene.add(earthSphere);
    scene.add(moonSphere);
}

function displayObserver() {
    scene.add(observerSphere);
    const x = Math.cos(sun.latitude * DEGRAD) * Math.cos(sun.longitude * DEGRAD);
    const y = Math.cos(sun.latitude * DEGRAD) * Math.sin(sun.longitude * DEGRAD);
    const z = Math.sin(sun.latitude * DEGRAD);
    observerSphere.position.set(x, y, z);
}

function displaySunOrbitData() {
    document.getElementById('sun-orbit-data').style.display = 'flex';
}

function displayMoonOrbitData() {
    document.getElementById('moon-orbit-data').style.display = 'flex';
}

function hideMoonOrbitData() {
    document.getElementById('moon-orbit-data').style.display = 'none';
}

function displayEarthOrbitData() {
    document.getElementById('earth-orbit-data').style.display = 'flex';
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

function hideEarthOrbitData() {
    document.getElementById('earth-orbit-data').style.display = 'none';
}

function hideSunOrbitData() {
    document.getElementById('sun-orbit-data').style.display = 'none';
}

function hideOnEarthPositionChooser() {
    document.querySelector('.positionChooser').style.display = 'none';
}

function hideObserver() {
    scene.remove(observerSphere);
}

function hideMoon() {
    scene.remove(moonSphere);
}

function hideEclipticOrbit() {
    scene.remove(eclipticOrbit);
}

function hideHorizontalOrbit() {
    scene.remove(horizontalOrbit);
}