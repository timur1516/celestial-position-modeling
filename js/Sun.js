const {sqrt, sin, cos, asin, atan2, PI, floor, abs} = Math;

class Sun {
    #t;                 // Текущее время
    #offset;            // Смещение часового пояса относительно Гринвича, ч
    #latitude;          // Долгота на поверхности Земли, градусы
    #longitude;         // Широта на поверхности Земли, градусы
    #AU;                // Астрономическая единица, м
    #T;                 // Орбитальный период Земли, сек
    #e;                 // Эксцентриситет
    #a;                 // Большая полуось, м

    #t0;                // Опорный момент (время перигелия)
    #dt;                // Разница между временем перигелия и текущим временем, сек

    #M;                 // Средняя аномалия, рад
    #L;                 // Средняя долгота Солнца
    #E;                 // Эксцентрическая аномалия, рад
    #w;                 // Долгота перигелия
    #oblecl;            // Наклон эклиптики

    #r;                 // Расстояние до Солнца, м
    #v;                 // Истинная аномалия, рад

    #lon;               // Долгота в эклиптических координатах, рад

    #GMST0;             // Звездное время на гринвичском меридиане в 00:00, ч
    #SIDTIME;           // Местное звездное время, ч
    #HA;                // Часовой угол, ч
    #UT;                // Время по Гринвичу, ч

    // Эклиптические прямоугольные координаты
    #xEcliptic;
    #yEcliptic;
    #zEcliptic;

    // Экваториальные прямоугольные координаты
    #xEquatorial;
    #yEquatorial;
    #zEquatorial;

    // Экваториальные координаты
    #rEquatorial;
    #RA;
    #Decl;

    // Горизонтальные прямоугольные координаты
    #xHorizontal;
    #yHorizontal;
    #zHorizontal;

    // Азимут и высота
    #azimuth;
    #altitude;

    constructor(time = new Date(), offset = new Date().getTimezoneOffset() / 60, latitude = 0, longitude = 0) {
        this.#t = time;
        this.#offset = offset;
        this.#latitude = latitude;
        this.#longitude = longitude;
        this.#init();
    }

    clone() {
        return new Sun(new Date(this.#t), this.#offset, this.#latitude, this.#longitude);
    }

    #rev(x, d) {
        return x - floor(x / d) * d;
    }

    #init() {
        this.#AU = 149597870700;
        this.#T = 365.24218985 * 24 * 3600;
        this.#e = 0.016708617;
        this.#a = this.#AU;
        this.#w = 283.386752193 * DEGRAD;
        this.#oblecl = 23.4406 * DEGRAD;
        this.#t0 = new Date(2024, 0, 3, 0, 39);
    }

    #calculateTimeParams() {
        this.#UT = this.#t.getHours() + this.#t.getMinutes() / 60;
        this.#UT += this.#offset * -1;
    }

    #calculateKeplerOrbit() {
        this.#dt = (this.#t - this.#t0) / 1000;

        this.#M = 2 * PI * (this.#dt / this.#T);
        this.#M = this.#rev(this.#M, 2 * PI);

        this.#L = this.#rev(this.#w + this.#M, 2 * PI);

        let E0 = this.#M
        this.#E = E0 - this.#e * sin(E0) + this.#M
        while (abs(this.#E - E0) > 10 ** -9) {
            E0 = this.#E
            this.#E = this.#e * sin(E0) + this.#M
        }
    }

    #calculateEclipticCoordinates() {
        this.#calculateKeplerOrbit();
        this.#v = 2 * atan2(
            sqrt(1 + this.#e) * sin(this.#E / 2),
            sqrt(1 - this.#e) * cos(this.#E / 2)
        );

        this.#r = this.#a * (1 - this.#e ** 2) / (1 + this.#e * cos(this.#v));
        this.#lon = this.#v + this.#w;

        this.#xEcliptic = this.#r * Math.cos(this.#lon);
        this.#yEcliptic = this.#r * Math.sin(this.#lon);
        this.#zEcliptic = 0.0;
    }

    #calculateEquatorialCoordinates() {
        this.#calculateEclipticCoordinates();
        this.#xEquatorial = this.#xEcliptic;
        this.#yEquatorial = this.#yEcliptic * Math.cos(this.#oblecl) - this.#zEcliptic * Math.sin(this.#oblecl);
        this.#zEquatorial = this.#yEcliptic * Math.sin(this.#oblecl) + this.#zEcliptic * Math.cos(this.#oblecl);

        this.#rEquatorial = Math.sqrt(this.#xEquatorial * this.#xEquatorial + this.#yEquatorial * this.#yEquatorial + this.#zEquatorial * this.#zEquatorial);
        this.#RA = Math.atan2(this.#yEquatorial, this.#xEquatorial);
        this.#Decl = Math.atan2(this.#zEquatorial, Math.sqrt(this.#xEquatorial * this.#xEquatorial + this.#yEquatorial * this.#yEquatorial));
    }

    #calculateHorizontalCoordinates() {
        this.#calculateEquatorialCoordinates();
        this.#calculateTimeParams();
        this.#GMST0 = this.#L * RADEG / 15 + 12;
        this.#SIDTIME = this.#GMST0 + this.#UT + this.#longitude / 15;

        this.#HA = this.#SIDTIME - this.#RA * RADEG / 15;
        this.#HA *= 15;

        let x = Math.cos(this.#HA * DEGRAD) * Math.cos(this.#Decl);
        let y = Math.sin(this.#HA * DEGRAD) * Math.cos(this.#Decl);
        let z = Math.sin(this.#Decl);

        this.#xHorizontal = x * Math.cos((90 - this.#latitude) * DEGRAD) - z * Math.sin((90 - this.#latitude) * DEGRAD);
        this.#yHorizontal = y;
        this.#zHorizontal = x * Math.sin((90 - this.#latitude) * DEGRAD) + z * Math.cos((90 - this.#latitude) * DEGRAD);

        this.#azimuth = Math.atan2(this.#yHorizontal, this.#xHorizontal) + PI;
        this.#altitude = Math.asin(this.#zHorizontal);
    }

    get rectangularEclipticCoordinates() {
        this.#calculateEclipticCoordinates();
        return {x: this.#xEcliptic / this.#AU, y: this.#yEcliptic / this.#AU, z: this.#zEcliptic / this.#AU};
    }

    get rectangularHorizontalCoordinates() {
        this.#calculateHorizontalCoordinates();
        return {x: this.#xHorizontal, y: this.#yHorizontal, z: this.#zHorizontal};
    }

    get T() {
        return this.#t;
    }

    set T(value) {
        this.#t = value;
    }

    set offset(value) {
        this.#offset = value;
    }

    set latitude(value) {
        this.#latitude = value;
    }

    set longitude(value) {
        this.#longitude = value;
    }

    get offset() {
        return this.#offset;
    }

    get latitude() {
        return this.#latitude;
    }

    get longitude() {
        return this.#longitude;
    }

    get r() {
        return this.#r / this.#AU;
    }

    get v() {
        return this.#v;
    }

    get xEcliptic() {
        return this.#xEcliptic / this.#AU;
    }

    get yEcliptic() {
        return this.#yEcliptic / this.#AU;
    }

    get zEcliptic() {
        return this.#zEcliptic / this.#AU;
    }
    get RA() {
        return this.#RA;
    }

    get Decl() {
        return this.#Decl;
    }

    get azimuth() {
        return this.#azimuth;
    }

    get altitude() {
        return this.#altitude;
    }
}