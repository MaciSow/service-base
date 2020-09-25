import {Car} from "../model/Car";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {addIcons, formatAmount, getParValueFromUrl, getStringDate} from "../utilities";
import {Repair} from "../model/Repair";

export class RepairInfo {
    car: Car;
    repair: Repair;
    private carService: CarService;
    private routing: Routing;
    private repairInfoPage: HTMLDivElement;

    constructor(routing: Routing, carService: CarService, car: Car, repair: Repair) {
        this.repairInfoPage = document.querySelector('.js-repair-info');
        this.carService = carService;
        this.routing = routing;
        this.car = car;
        this.repair = repair;

        if (!this.repairInfoPage) {
            return;
        }

        if (this.car.repairs.length) {
            this.init();
            return;
        }

        const id = +getParValueFromUrl('repair');
        this.carService.getRepair(id).then(repair => {
            this.repair = repair;
            this.init();
        });
    }

    private init() {
        this.routing.setBack('/', 'js-repair-info', 'js-car-details');
        document.title = `Repair Info - ${this.repair.title}`;
        this.carService.getParts(this.repair).then(parts => {
            this.repair.parts = parts;
            this.fillWindow();
            addIcons();
        })
    }

    private fillWindow() {
        let carHtml = this.createWindow();
        this.repairInfoPage.insertAdjacentHTML("beforeend", carHtml)
    }

    private createWindow(): string {
        return ` <div class="l-repair-info">
            <div class="l-repair-info__header">
                <img class="header__image" src="./../../images/${this.car.image}" alt="no brum brum">
                <div class="header__info">
                    <h2 class="o-car-name--lg">${this.car.fullName()}</h2>
                    <div class="u-separator-m"></div>
                    <div class="header__info-title">
                        <span >${this.repair.title}</span>
                        <button class="o-btn-ico header__info-edit"><i class="ico edit"></i></button>
                    </div>
                    <div class="header__info-data">
                        <div>
                            <span class="">Date:</span>
                            <span class="u-txt-b">${getStringDate(this.repair.date)}</span>
                        </div>   
                        <div>
                            <span class="">Mileage:</span>
                            <span class="u-txt-b">${this.repair.mileage} km</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="l-repair-info__content">
                <div class="u-flex-r u-d-flex">
                    <form class="c-search " method="get">
                        <label class="c-search__label" for="searchList">search</label>
                        <input class="c-search__input o-input" type="search" name="searchList" id="searchList">
                        <button class="c-search__button o-btn-ico--search" type="submit">
                            <i class="ico search"></i>
                        </button>
                    </form>
                </div>

                <div class="c-list-header u-col-parts">
                    <span class="o-checkbox"></span>
                    <span>Part/Service</span>
                    <span>Model/Firm</span>
                    <span>Price</span>
                    <span>Files</span>
                    <span>Actions</span>
                </div> 
                <ol class="c-list">
                    ${this.createPartList()}
                </ol>
                <div class="c-list-footer">
                    <span class="c-list-footer__left">Sum:</span>
                    <span class="u-text--right">${formatAmount(this.repair.costsSum())} $</span>
                    <span>Amount: ${this.repair.parts.length}</span>
                </div> 
            ${this.createNotice()}
            </div>
           
        </div>`;
    }

    private createPartList(): string {
        let repairListHtml = '';
        this.repair.parts.forEach(part =>
            repairListHtml += `<li class="c-list__item u-col-parts">
                                    <span class="o-checkbox"></span>
                                    <span>${part.name}</span>
                                    <span>${part.model}</span>
                                    <span class="u-text--right">${formatAmount(part.price)} $</span>
                                    <div class="u-d-flex-center">        
                                        <button class="o-btn-ico u-mr--sx"><i class="ico invoice"></i></button>
                                        <button class="o-btn-ico u-ml--sx"><i class="ico notice"></i></button>
                                    </div>
                                    <div class="u-d-flex-center">
                                        <button class="o-btn-ico u-mr--sx"><i class="ico edit"></i></button>
                                        <button class="o-btn-ico u-ml--sx"><i class="ico delete"></i></button>
                                    </div>
                                </li>`)

        return repairListHtml;
    }

    private createNotice(): string {
        if (!this.repair.notice) {
            return '';
        }
        return `<div class="content__notice">
                <span class="u-txt-b">Notice:</span>
                <p class="u-mt--xs">${this.repair.notice}</p>
             </div>`
    }
}