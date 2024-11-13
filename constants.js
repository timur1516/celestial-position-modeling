const RADEG = (180.0 / Math.PI);
const DEGRAD = (Math.PI / 180.0);

const viewModes = Object.freeze({
    SUN_AROUND_EARTH: 0,
    EARTH_AROUND_SUN: 1,
});

const FPS = 100;
const FRAME_INTERVAL = 1000 / FPS;