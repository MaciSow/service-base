import {Car} from "../model/Car";
import {addIcons, getStringDate} from "../utilities";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";

export class CarDetails {
    car: Car;
    private carService: CarService;
    private routing: Routing;
    private carDetailsPage: HTMLDivElement;

    constructor(car: Car, routing: Routing, carService: CarService) {
        this.carService = carService;
        this.routing = routing;
        this.car = car;
        this.init();
    }

    private init() {
        this.carDetailsPage = document.querySelector('.js-car-details');
        this.routing.setBack('/', 'js-car-details', 'js-menu-page');

        if (!this.carDetailsPage) {
            return;
        }

        document.title = `Details - ${this.car.fullName()}`;
        this.carService.getRepairs(this.car).then(repairs => {
            this.car.repairs = repairs;
            this.fillWindow();
            this.clickListener();
            addIcons();
        });
    }

    private fillWindow() {
        let carHtml = this.createWindow();
        this.carDetailsPage.insertAdjacentHTML("beforeend", carHtml)
    }

    private createWindow(): string {
        return ` <div class="l-car-details">
            <div class="l-car-details__header">
                <img class="header__image" src="./../../images/${this.car.image}" alt="no brum brum">
                <div class="header__info">
                    <h2 class="o-car-name--lg">${this.car.fullName()}</h2>
                    <div class="u-separator-m"></div>
                    <div class="header__info-data">
                        <button class="o-btn-ico header__info-data-edit"><i class="ico edit"></i></button>
                        <div>
                            <span class="">Body Style:</span>
                            <span class="u-txt-b">${this.car.bodyStyle}</span>
                        </div>
                        <div>
                            <span class="">Engine:</span>
                            <span class="u-txt-b">${this.car.engine} ${this.car.engine.name}</span>
                        </div>
                        <div>
                            <span class="">Insurance:</span>
                            <span class="u-txt-b">${this.car.insurance}</span>
                        </div>
                        <div>
                            <span class="">Version:</span>
                            <span class="u-txt-b">${this.car.version}</span>
                        </div>
                        <div>
                            <span class="">Power:</span>
                            <span class="u-txt-b">${this.car.engine.power} KM</span>
                        </div>
                        <div>
                            <span class="">Overview:</span>
                            <span class="u-txt-b">${getStringDate(this.car.overview)}</span>
                        </div>
                        <div>
                            <span class="">Year:</span>
                            <span class="u-txt-b">${this.car.year}</span>
                        </div>
                        <div>
                            <span class="">Torque:</span>
                            <span class="u-txt-b">${this.car.engine.torque} NM</span>
                        </div>
                        <div>
                            <span class="">Oil change:</span>
                            <span class="u-txt-b">todo</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="l-car-details__content">
                <div class="u-flex-r u-d-flex">
                    <form class="c-search " method="get">
                        <label class="c-search__label" for="searchList">search</label>
                        <input class="c-search__input o-input" type="search" name="searchList" id="searchList">
                        <button class="c-search__button o-btn-ico--search" type="submit">
                            <i class="ico search"></i>
                        </button>
                    </form>
                </div>

                <div class="c-list-header u-col-repairs">
                    <span class="o-checkbox"></span>
                    <span>Title</span>
                    <span>Date</span>
                    <span>Mileage</span>
                </div> 
                <ol class="c-list">
                    ${this.createRepairList()}
                </ol>
            </div>
        </div>`;
    }

    private createRepairList(): string {
        let repairListHtml = '';
        this.car.repairs.forEach(repair =>
            repairListHtml += `<li class="c-list__item">
                                <span class="o-checkbox"></span>
                                    <button data-id="${repair.id}"  class="item__link js-repair-item">
                                        <span>${repair.title}</span>
                                        <span>${getStringDate(repair.date)}</span>
                                        <span>${repair.mileage} km</span>
                                    </button>
                                </li>`)

        return repairListHtml;
    }

    private clickListener() {
        const repairItems = this.carDetailsPage.querySelectorAll('.js-repair-item') as NodeListOf<HTMLButtonElement>

        repairItems.forEach(button =>
            button.addEventListener('click', (ev) => this.select(ev)))
    }

    private select(ev: MouseEvent) {
        ev.preventDefault();
        const btn = ev.currentTarget as HTMLButtonElement;

        this.routing.goRepairInfo(this.car.id, +(btn.dataset.id));
    }
}