import {Car} from "../model/Car";
import {CarDetails} from "./CarDetails";
import {hideWindow, showWindow} from "../utilities";
import {setBack} from "../app";
import {CarService} from "../services/CarService";

export class Menu {
    private menuPage: HTMLDivElement;
    private carService: CarService;


    constructor(carService: CarService) {
        this.carService = carService;
        this.init();
    }

    private init() {
        this.menuPage = document.querySelector('.js-menu-page');
        setBack();

        if (!this.menuPage) {
            return;
        }

        this.createMenu();
        this.clickListener();
    }

    private createMenu() {
        let carHtml = '';
        this.carService.getCars().forEach(car => carHtml += Menu.createItem(car));

        let navHTML = `<nav class="l-menu js-menu">${carHtml}</nav>
        <button class="o-btn-more">
            <span class="o-btn-more__dot"></span>
            <span class="o-btn-more__dot"></span>
            <span class="o-btn-more__dot"></span>
        </button>`

        this.menuPage.insertAdjacentHTML("beforeend", navHTML);
    }

    private static createItem(car: Car): string {
        return `<button data-id = "${car.id}" class="o-btn-menu js-btn-menu"><img src="images/${car.image}" alt="no brum brum">
                    <div class="o-btn-menu__title">
                        <h2 class="o-car-name">${car.fullName()}</h2>
                        <div class="u-d-flex u-mt--xs">
                            <span class="o-car-info">${car.engine}</span>
                            <div class="u-spacer"></div>
                            <span class="o-car-info">${car.year} r</span>
                        </div>
                    </div>
                </button>`;
    }

    private clickListener() {
        const menuButtons = this.menuPage.querySelector('.js-menu').childNodes as NodeListOf<HTMLButtonElement>

        menuButtons.forEach(button => {
            button.addEventListener('click', (ev) => (this.select(ev)));
        })
    }

    private select(ev: MouseEvent) {
        ev.preventDefault();
        const btn = ev.currentTarget as HTMLButtonElement;

        const carId = +(btn.dataset.id)
        const car = this.carService.getCar(carId);


        history.pushState({car: carId}, "Car Details", `?car=${carId}`)

        hideWindow().then(() => {
            new CarDetails(car)
            const carDetailsPage = document.querySelector('.js-car-details');
            showWindow(carDetailsPage);
        });
    }
}