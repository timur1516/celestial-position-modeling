class SunBasic {
    #T;

    #xEcliptic; #yEcliptic; #zEcliptic;             // Эклиптические прямоугольные координаты

    constructor(T = new Date(), offset = new Date().getTimezoneOffset() / 60) {
        this.#T = T;
    }

    clone() {
        return new SunBasic(new Date(this.#T));
    }

    // Приводит значение в градусах в промежуток от 0 до 360
    #rev(x, d) {
        return x - Math.floor(x / d) * d;
    }


    #calculateRectangularEclipticCoordinates(){

    }
}