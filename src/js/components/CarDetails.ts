import {Car} from "../model/Car";
import {addIcons, getStringDate} from "../utilities";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {PageHelper} from "../services/PageHelper";

export class CarDetails {
    car: Car;
    private carService: CarService;
    private routing: Routing;
    private carDetailsPage: HTMLDivElement;
    private pageHelper: PageHelper;

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
            this.eventListeners();
            this.pageHelper = new PageHelper('js-repairs');
            this.pageHelper.handleCheck(null);
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
                <div class="l-car-details__action">
                    <button class="o-btn--warning u-hide js-delete-all-btn">
                        <i class="ico delete"></i>
                        <span class="">delete selected</span>
                    </button>
                    <div class="u-spacer"></div>
                    <form class="c-search " method="get">
                        <label class="c-search__label" for="searchList">search</label>
                        <input class="c-search__input o-input" type="search" name="searchList" id="searchList">
                        <button class="c-search__button o-btn-ico--search" type="submit">
                            <i class="ico search"></i>
                        </button>
                    </form>
                </div>

                <div class="c-list-header u-col-repairs">
                    <label class="o-checkbox">
                      <input class="o-checkbox__input  js-checkbox-main" type="checkbox">
                      <span class="o-checkbox__checkmark"></span>
                    </label>
                    <span>Title</span>
                    <span>Date</span>
                    <span>Mileage</span>
                </div> 
                <ol class="c-list js-repairs">
                    ${this.createRepairList()}
                </ol>
            </div>
        </div>`;
    }

    private createRepairList(): string {
        let repairListHtml = '';
        this.car.repairs.forEach(repair =>
            repairListHtml += `<li class="c-list__item" data-id="${repair.id}">
                                    <label class="o-checkbox">
                                      <input class="o-checkbox__input  js-checkbox" type="checkbox">
                                      <span class="o-checkbox__checkmark"></span>
                                    </label>
                                    <button data-id="${repair.id}"  class="item__link js-repair-item">
                                        <span>${repair.title}</span>
                                        <span>${getStringDate(repair.date)}</span>
                                        <span>${repair.mileage} km</span>
                                    </button>
                                </li>`)

        return repairListHtml;
    }

    private eventListeners() {
        const selectRepairItems = this.carDetailsPage.querySelectorAll('.js-repair-item') as NodeListOf<HTMLButtonElement>
        const deleteAllBtn = this.carDetailsPage.querySelector('.js-delete-all-btn') as HTMLButtonElement;

        selectRepairItems.forEach(button =>
            button.addEventListener('click', (ev) => this.select(ev))
        )
        deleteAllBtn.addEventListener('click', () => this.handleDeleteAll())
    }

    private select(ev: MouseEvent) {
        ev.preventDefault();
        const btn = ev.currentTarget as HTMLButtonElement;

        this.routing.goRepairInfo(this.car.id, +(btn.dataset.id));
    }

    private handleDeleteAll() {
        const repairsId = this.pageHelper.getCheckedItems()

        repairsId.forEach(item => this.pageHelper.preDeleteItem(item))

        this.carService.deleteRepairs(this.car, repairsId).then(isDeleted => {
            if (isDeleted) {
                repairsId.forEach( item => this.pageHelper.deleteItem(item))
            }
        });
    }

    // private deleteRepair(item: HTMLLIElement) {
    //     const repair = this.car.repairs.find(repair => repair.id === +item.dataset.id)
    //
    //     this.carService.deleteRepair(repair).then(isDeleted => {
    //         console.log(isDeleted);
    //
    //         this.pageHelper.preDeleteItem(item);
    //
    //         if (isDeleted) {
    //             setTimeout(() => {
    //                 this.pageHelper.deletingItem(item);
    //                 setTimeout(() => {
    //                     this.pageHelper.postDeleteItem(item);
    //                 }, 450)
    //             }, 250)
    //         }
    //     });
    // }
}