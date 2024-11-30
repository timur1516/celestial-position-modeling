class Sun {
    #T;
    #offset;
    #latitude;
    #longitude;

    #UT;            // Время по Гринвичу в часах
    #d;             // Кол-во дней с 0,0 TDT января 2000 года

    #w;             // Долгота перигелия
    #a;             // Среднее расстояние, а.е.
    #e;             // Эксцентриситет
    #M;             // Средняя аномалия
    #oblecl;        // Наклон эклиптики
    #L;             // Средняя долгота Солнца
    #E;             // Эксцентрическая аномалия

    #r;             // Гелиоцентрическое расстояние
    #lon;           // Долгота в эклиптических координатах
    #v;             // Истинная аномалия

    #GMST0          // Звездное время на гринвичском меридиане в 00:00 в часах
    #SIDTIME        // Местное звездное время в часах
    #HA             // Часовой угол

    // Координаты в плоскости эклиптики
    #xInPlaneOfEcliptic;

    #yInPlaneOfEcliptic;
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
    #RAEquatorial;

    #DeclEquatorial;

    #xHorizontal;
    #yHorizontal;
    #zHorizontal;      // Горизонтальные прямоугольные координаты
    #azimuth;
    #altitude                             // Азимут и высота

    constructor(T = new Date(), offset = new Date().getTimezoneOffset() / 60, latitude = 0, longitude = 0) {
        this.#T = T;
        this.#offset = offset;
        this.#latitude = latitude;
        this.#longitude = longitude;
    }

    clone() {
        return new Sun(new Date(this.#T), this.#offset, this.#latitude, this.#longitude);
    }

    #rev(x, d) {
        return x - Math.floor(x / d) * d;
    }

    #calculateTimeParams() {
        this.#UT = this.#T.getHours() + this.#T.getMinutes() / 60;
        this.#UT += this.#offset * -1;
        this.#d = 367 * this.#T.getFullYear() - Math.floor(7 * (this.#T.getFullYear() + Math.floor(((this.#T.getMonth() + 1) + 9) / 12)) / 4) + Math.floor((275 * (this.#T.getMonth() + 1)) / 9) + this.#T.getDate() - 730530;
    }

    #calculateKeplerOrbit() {
        this.#calculateTimeParams();
        this.#w = 282.9404 + 4.70935E-5 * this.#d;
        this.#a = 1.000000;
        this.#e = 0.016709 - 1.151E-9 * this.#d;
        this.#M = 356.0470 + 0.9856002585 * this.#d;
        this.#M = this.#rev(this.#M, 360.0);
        this.#oblecl = 23.4393 - 3.563E-7 * this.#d;
        this.#L = this.#w + this.#M;
        this.#L = this.#rev(this.#L, 360.0);
        this.#E = this.#M + RADEG * this.#e * Math.sin(this.#M * DEGRAD) * (1 + this.#e * Math.cos(this.#M * DEGRAD));
    }

    #calculateRectangularEclipticCoordinates() {
        this.#calculateKeplerOrbit();
        this.#xInPlaneOfEcliptic = Math.cos(this.#E * DEGRAD) - this.#e;
        this.#yInPlaneOfEcliptic = Math.sin(this.#E * DEGRAD) * Math.sqrt(1 - this.#e * this.#e);

        this.#r = Math.sqrt(this.#xInPlaneOfEcliptic * this.#xInPlaneOfEcliptic + this.#yInPlaneOfEcliptic * this.#yInPlaneOfEcliptic);
        this.#v = Math.atan2(this.#yInPlaneOfEcliptic, this.#xInPlaneOfEcliptic) * RADEG;

        this.#lon = this.#v + this.#w;
        this.#lon = this.#rev(this.#lon, 360.0);

        this.#xEcliptic = this.#r * Math.cos(this.#lon * DEGRAD);
        this.#yEcliptic = this.#r * Math.sin(this.#lon * DEGRAD);
        this.#zEcliptic = 0.0;
    }

    #calculateRectangularEquatorialCoordinates() {
        this.#calculateRectangularEclipticCoordinates();
        this.#xEquatorial = this.#xEcliptic;
        this.#yEquatorial = this.#yEcliptic * Math.cos(this.#oblecl * DEGRAD) - this.#zEcliptic * Math.sin(this.#oblecl * DEGRAD);
        this.#zEquatorial = this.#yEcliptic * Math.sin(this.#oblecl * DEGRAD) + this.#zEcliptic * Math.cos(this.#oblecl * DEGRAD);
    }

    #calculateEquatorialCoordinates() {
        this.#calculateRectangularEquatorialCoordinates();

        this.#rEquatorial = Math.sqrt(this.#xEquatorial * this.#xEquatorial + this.#yEquatorial * this.#yEquatorial + this.#zEquatorial * this.#zEquatorial);
        this.#RAEquatorial = Math.atan2(this.#yEquatorial, this.#xEquatorial) * RADEG;
        this.#DeclEquatorial = Math.atan2(this.#zEquatorial, Math.sqrt(this.#xEquatorial * this.#xEquatorial + this.#yEquatorial * this.#yEquatorial)) * RADEG;
    }

    #calculateRectangularHorizontalCoordinates() {
        this.#calculateEquatorialCoordinates();

        this.#GMST0 = this.#L / 15 + 12;
        this.#SIDTIME = this.#GMST0 + this.#UT + this.#longitude / 15;

        this.#HA = this.#SIDTIME - this.#RAEquatorial / 15;
        this.#HA *= 15;

        let x = Math.cos(this.#HA * DEGRAD) * Math.cos(this.#DeclEquatorial * DEGRAD);
        let y = Math.sin(this.#HA * DEGRAD) * Math.cos(this.#DeclEquatorial * DEGRAD);
        let z = Math.sin(this.#DeclEquatorial * DEGRAD);

        this.#xHorizontal = x * Math.cos((90 - this.#latitude) * DEGRAD) - z * Math.sin((90 - this.#latitude) * DEGRAD);
        this.#yHorizontal = y;
        this.#zHorizontal = x * Math.sin((90 - this.#latitude) * DEGRAD) + z * Math.cos((90 - this.#latitude) * DEGRAD);
    }

    #calculateHorizontalCoordinates() {
        this.#calculateRectangularHorizontalCoordinates();
        this.#azimuth = Math.atan2(this.#yHorizontal, this.#xHorizontal) * RADEG + 180;
        this.#altitude = Math.asin(this.#zHorizontal) * RADEG;
    }

    get rectangularEclipticCoordinates() {
        this.#calculateRectangularEclipticCoordinates();
        return {x: this.#xEcliptic, y: this.#yEcliptic, z: this.#zEcliptic};
    }

    get rectangularEquatorialCoordinates() {
        this.#calculateRectangularEquatorialCoordinates();
        return {x: this.#xEquatorial, y: this.#yEquatorial, z: this.#zEquatorial};
    }

    get equatorialCoordinates() {
        this.#calculateEquatorialCoordinates();
        return {r: this.#rEquatorial, RA: this.#RAEquatorial, Decl: this.#DeclEquatorial};
    }

    get rectangularHorizontalCoordinates() {
        this.#calculateRectangularHorizontalCoordinates();
        return {x: this.#xHorizontal, y: this.#yHorizontal, z: this.#zHorizontal};
    }

    get horizontalCoordinates() {
        this.#calculateHorizontalCoordinates();
        return {x: this.#xHorizontal, y: this.#yHorizontal, z: this.#zHorizontal};
    }

    set T(value) {
        this.#T = value;
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

    get T() {
        return this.#T;
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

    get d() {
        return this.#d;
    }

    get w() {
        return this.#w;
    }

    get a() {
        return this.#a;
    }

    get e() {
        return this.#e;
    }

    get M() {
        return this.#M;
    }

    get oblecl() {
        return this.#oblecl;
    }

    get L() {
        return this.#L;
    }

    get E() {
        return this.#E;
    }

    get xInPlaneOfEcliptic() {
        return this.#xInPlaneOfEcliptic;
    }

    get yInPlaneOfEcliptic() {
        return this.#yInPlaneOfEcliptic;
    }

    get r() {
        return this.#r;
    }

    get lon() {
        return this.#lon;
    }

    get v() {
        return this.#v;
    }

    get xHorizontal() {
        return this.#xHorizontal;
    }

    get yHorizontal() {
        return this.#yHorizontal;
    }

    get zHorizontal() {
        return this.#zHorizontal;
    }

    get azimuth() {
        return this.#azimuth;
    }

    get altitude() {
        return this.#altitude;
    }
}