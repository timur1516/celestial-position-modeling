class Sun {
    #T = new Date();
    #offset = new Date().getTimezoneOffset() / 60;
    #latitude = 0;
    #longitude = 0;

    #UT;            // Время по Гринвичу в часах
    #d;             // Кол-во дней с 0,0 TDT января 2000 года

    #w;             // Долгота перигелия
    #a;             // Среднее расстояние, а.е.
    #e;             // Эксцентриситет
    #M;             // Средняя аномалия
    #oblecl;        // Наклон эклиптики
    #L;             // Средняя долгота Солнца
    #E;             // Эксцентрическая аномалия

    #xInPlaneOfEcliptic; #yInPlaneOfEcliptic;       // Координаты в плоскости эклиптики
    #r;             // Гелиоцентрическое расстояние
    #lon;           // Долгота в эклиптических координатах
    #v;             // Истинная аномалия
    #xEcliptic; #yEcliptic; #zEcliptic;             // Эклиптические прямоугольные координаты
    #xEquatorial; #yEquatorial; #zEquatorial;       // Экваториальные прямоугольные координаты
    #rEquatorial; #RAEquatorial; #DeclEquatorial;   // Экваториальные координаты

    #GMST0          // Звездное время на гринвичском меридиане в 00:00 в часах
    #SIDTIME        // Местное звездное время в часах
    #HA             // Часовой угол

    #xHorizontal; #yHorizontal;  #zHorizontal;      // Горизонтальные прямоугольные координаты
    #azimuth; #altitude                             // Азимут и высота

    // Приводит значение в градусах в промежуток от 0 до 360
    #rev(x, d) {
        return x - Math.floor(x / d) * d;
    }

    #calculateTimeParams(){
        this.#UT = this.#T.getHours() + this.#T.getMinutes() / 60;
        this.#UT += this.#offset * -1;
        this.#d = 367 * this.#T.getFullYear() - Math.floor(7 * (this.#T.getFullYear() + Math.floor(((this.#T.getMonth() + 1) + 9) / 12)) / 4) + Math.floor((275 * (this.#T.getMonth() + 1)) / 9) + this.#T.getDate() - 730530;
    }

    #calculateKeplerOrbit(){
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

    #calculateRectangularEclipticCoordinates(){
        this.#calculateKeplerOrbit();
        this.#xInPlaneOfEcliptic = Math.cos(this.#E * DEGRAD) - this.#e;
        this.#yInPlaneOfEcliptic = Math.sin(this.#E * DEGRAD) * Math.sqrt(1 - this.#e * this.#e);
        //Преобразовать в расстояние и истинную аномалию
        this.#r = Math.sqrt(this.#xInPlaneOfEcliptic * this.#xInPlaneOfEcliptic + this.#yInPlaneOfEcliptic * this.#yInPlaneOfEcliptic);
        this.#v = Math.atan2(this.#yInPlaneOfEcliptic, this.#xInPlaneOfEcliptic) * RADEG;
        //Долгота Солнца
        this.#lon = this.#v + this.#w;
        this.#lon = this.#rev(this.#lon, 360.0);
        //вычислим эклиптические прямоугольные координаты Солнца
        this.#xEcliptic = this.#r * Math.cos(this.#lon * DEGRAD);
        this.#yEcliptic = this.#r * Math.sin(this.#lon * DEGRAD);
        this.#zEcliptic = 0.0;
    }

    #calculateRectangularEquatorialCoordinates(){
        this.#calculateRectangularEclipticCoordinates();
        this.#xEquatorial = this.#xEcliptic;
        this.#yEquatorial = this.#yEcliptic * Math.cos(this.#oblecl * DEGRAD) - this.#zEcliptic * Math.sin(this.#oblecl * DEGRAD);
        this.#zEquatorial = this.#yEcliptic * Math.sin(this.#oblecl * DEGRAD) + this.#zEcliptic * Math.cos(this.#oblecl * DEGRAD);
    }

    #calculateEquatorialCoordinates(){
        this.#calculateRectangularEquatorialCoordinates();
        //вычислим прямое восхождение и склонение Солнца в градусах
        this.#rEquatorial = Math.sqrt(this.#xEquatorial * this.#xEquatorial + this.#yEquatorial * this.#yEquatorial + this.#zEquatorial * this.#zEquatorial);
        this.#RAEquatorial = Math.atan2(this.#yEquatorial, this.#xEquatorial) * RADEG;
        this.#DeclEquatorial = Math.atan2(this.#zEquatorial, Math.sqrt(this.#xEquatorial * this.#xEquatorial + this.#yEquatorial * this.#yEquatorial)) * RADEG;
    }

    #calculateRectangularHorizontalCoordinates() {
        this.#calculateEquatorialCoordinates();
        //Звездное время и часовой угол. Высота и азимут
        this.#GMST0 = this.#L / 15 + 12;
        this.#SIDTIME = this.#GMST0 + this.#UT + this.#longitude / 15; //местное звездное время в часах
        //вычислим часовой угол в часах
        this.#HA = this.#SIDTIME - this.#RAEquatorial / 15;
        this.#HA *= 15;
        //преобразуем HA Солнца и Decl в прямоугольную (x, y, z) систему координат
        let x = Math.cos(this.#HA * DEGRAD) * Math.cos(this.#DeclEquatorial * DEGRAD);
        let y = Math.sin(this.#HA * DEGRAD) * Math.cos(this.#DeclEquatorial * DEGRAD);
        let z = Math.sin(this.#DeclEquatorial * DEGRAD);

        //Теперь мы повернем эту систему x, y, z вдоль оси, идущей с востока на запад
        this.#xHorizontal = x * Math.cos((90 - this.#latitude) * DEGRAD) - z * Math.sin((90 - this.#latitude) * DEGRAD);
        this.#yHorizontal = y;
        this.#zHorizontal = x * Math.sin((90 - this.#latitude) * DEGRAD) + z * Math.cos((90 - this.#latitude) * DEGRAD);
    }

    #calculateHorizontalCoordinates(){
        this.#calculateRectangularHorizontalCoordinates();
        //Вычисляем азимут и высоту в градусах
        this.#azimuth = Math.atan2(this.#yHorizontal, this.#xHorizontal) * RADEG + 180;
        this.#altitude = Math.asin(this.#zHorizontal) * RADEG;
    }

    get rectangularEclipticCoordinates(){
        this.#calculateRectangularEclipticCoordinates();
        return { x : this.#xEcliptic, y : this.#yEcliptic, z : this.#zEcliptic };
    }

    get rectangularEquatorialCoordinates(){
        this.#calculateRectangularEquatorialCoordinates();
        return { x : this.#xEquatorial, y : this.#yEquatorial, z : this.#zEquatorial };
    }

    get equatorialCoordinates(){
        this.#calculateEquatorialCoordinates();
        return {r : this.#rEquatorial, RA: this.#RAEquatorial, Decl : this.#DeclEquatorial };
    }

    get rectangularHorizontalCoordinates(){
        this.#calculateRectangularHorizontalCoordinates();
        return { x : this.#xHorizontal, y : this.#yHorizontal, z : this.#zHorizontal };
    }

    get horizontalCoordinates(){
        this.#calculateHorizontalCoordinates();
        return { x : this.#xHorizontal, y : this.#yHorizontal, z : this.#zHorizontal };
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