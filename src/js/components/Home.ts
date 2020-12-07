import {Car} from "../model/Car";
import {CarService} from "../services/CarService";
import {Routing} from "../services/Routing";
import {addIcons} from "../utilities";

export class Home {
    private homePage: HTMLDivElement;
    private carService: CarService;
    private readonly routing: Routing;

    constructor(carService: CarService, routing: Routing) {
        this.routing = routing;
        this.carService = carService;
        this.init();
    }

    private init() {
        this.homePage = document.querySelector('.js-menu-page');
        this.routing.setBack();

        if (!this.homePage) {
            return;
        }

        document.title = `Service Base`;
        this.createMenu();
        this.clickListener();
        addIcons();
    }

    private createMenu() {

        let carHtml = '';
        this.carService.getCars().forEach(car => carHtml += Home.createItem(car));

        let navHTML = `<nav class="l-menu js-menu">${carHtml}</nav>
        <button class="o-btn-more">
            <span class="o-btn-more__dot"></span>
            <span class="o-btn-more__dot"></span>
            <span class="o-btn-more__dot"></span>
        </button>`

        this.homePage.insertAdjacentHTML("beforeend", navHTML);
    }

    private static createItem(car: Car): string {
        return `<button data-id = "${car.id}" class="o-btn-menu o-car-thumb js-btn-menu">    
                   <i class="ico car"></i>
                   <img class="o-car-thumb__image" src="${car.image}" alt="no brum brum">
                    <div class="o-btn-menu__title">
                        <h2 class="o-title-l1--simple">${car.fullName()}</h2>
                        <div class="u-d-flex u-mt--sm">
                            <span class="o-title-l2--simple">${car.engine}</span>
                            <div class="u-spacer"></div>
                            <span class="o-title-l2--simple">${car.year} r</span>
                        </div>
                    </div>
                </button>`;
    }

    private clickListener() {
        const menuButtons = this.homePage.querySelector('.js-menu').childNodes as NodeListOf<HTMLButtonElement>;

        menuButtons.forEach(button => {
            button.addEventListener('click', (ev) => (this.select(ev)));
        })
    }

    private select(ev: MouseEvent) {
        ev.preventDefault();
        const btn = ev.currentTarget as HTMLButtonElement;

        this.routing.goDetails(btn.dataset.id);
    }
}