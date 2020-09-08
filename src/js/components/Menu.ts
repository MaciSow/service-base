interface Car {
    name: string;
    engine: string;
    year: number;
    image: string;
}


export class Menu {
    cars: Car[];
    private menuContainer: HTMLDivElement;

    constructor() {
        this.cars = [];
        this.init();
    }

    private init() {
        this.menuContainer = document.querySelector('.js-menu');
        this.fill();
        this.createMenu();
    }

    private fill() {
        this.cars.push(
            {
                name: 'Audi S5',
                engine: 'V8 4.2L',
                year: 2008,
                image: 'car1.jpg'
            });
        this.cars.push(
            {
                name: 'Audi S5',
                engine: 'V8 4.2L',
                year: 2008,
                image: 'car1.jpg'
            });
        this.cars.push(
            {
                name: 'Audi S5',
                engine: 'V8 4.2L',
                year: 2008,
                image: 'car1.jpg'
            });
        this.cars.push(
            {
                name: 'Audi S5',
                engine: 'V8 4.2L',
                year: 2008,
                image: 'car1.jpg'
            });
        this.cars.push(
            {
                name: 'Audi S5',
                engine: 'V8 4.2L',
                year: 2008,
                image: 'car1.jpg'
            });
        this.cars.push(
            {
                name: 'Audi S5',
                engine: 'V8 4.2L',
                year: 2008,
                image: 'car1.jpg'
            });
    }

    private createMenu() {
        this.cars.forEach(car => {
            let carHtml = Menu.createItem(car);
            this.menuContainer.insertAdjacentHTML("beforeend", carHtml)
        })
    }

    private static createItem(car: Car): string {
        return `<div class="o-btn-menu"><img src="images/${car.image}" alt="no brum brum">
                    <div class="o-btn-menu__title">
                        <h2 class="o-car-name">${car.name}</h2>
                        <div class="u-d-flex u-mt--xs">
                            <span class="o-car-info">${car.engine}</span>
                            <div class="u-spacer"></div>
                            <span class="o-car-info">${car.year} r</span>
                        </div>
                    </div>
                </div>`;
    }
}