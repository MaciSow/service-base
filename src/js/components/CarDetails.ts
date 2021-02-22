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
        let img = '';
        if (this.car.image) {
            img = `<img class="o-car-thumb__image" src="${this.car.image}" alt="no brum brum">`;
        }

        return ` <div class="l-car-details">
            <button class="o-btn-ico--delete l-car-details__delete-all js-delete-car"><i class="ico Xdelete"></i></button>
            <div class="l-car-details__header">
                <div class="header__avatar o-car-thumb">
                    <i class="ico car"></i>
                    ${img}
                </div>
                <div class="header__info">
                    <h2 class="o-title-l1">${this.car.fullName()}</h2>
                    <div class="header__info-data">
                        <button class="o-btn-ico header__info-data-edit js-edit"><i class="ico edit"></i></button>
                        <div>
                            <span class="">Body Style:</span>
                            <span class="u-txt-b">${this.car.bodyStyle ? this.car.bodyStyle : '---'}</span>
                        </div>
                        <div>
                            <span class="">Engine:</span>
                            <span class="u-txt-b">${this.car.engine} ${this.car.engine.name ? this.car.engine.name : '---'}</span>
                        </div>
                        <div>
                            <span class="">Insurance:</span>
                            <span class="u-txt-b">${this.car.insurance.expireDate ? getStringDate(this.car.insurance.expireDate) : '---'}</span>
                        </div>
                        <div>
                            <span class="">Version:</span>
                            <span class="u-txt-b">${this.car.version ? this.car.version : '---'}</span>
                        </div>
                        <div>
                            <span class="">Power:</span>
                            <span class="u-txt-b">${this.car.engine.power ? this.car.engine.power : '---'} KM</span>
                        </div>
                        <div>
                            <span class="">Overview:</span>
                            <span class="u-txt-b">${getStringDate(this.car.overview)}</span>
                        </div>
                        <div>
                            <span class="">Year:</span>
                            <span class="u-txt-b">${this.car.year ? this.car.year : '---'}</span>
                        </div>
                        <div>
                            <span class="">Torque:</span>
                            <span class="u-txt-b">${this.car.engine.torque ? this.car.engine.torque : '---'} NM</span>
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
                    <span class="u-p-4">Title</span>
                    <span class="u-p-4">Date</span>
                    <span class="u-p-4">Mileage</span>
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
            repairListHtml += `<li class="c-list__item item-underline" data-id="${repair.id}">
                                    <div class="item__checkbox ">
                                        <label class="o-checkbox">
                                          <input class="o-checkbox__input  js-checkbox" type="checkbox">
                                          <span class="o-checkbox__checkmark"></span>
                                        </label>
                                    </div>
                                    <button data-id="${repair.id}"  class="item__link js-repair-item">
                                        <span class="u-p-4">${repair.title}</span>
                                        <span class="u-p-4">${getStringDate(repair.date)}</span>
                                        <span class="u-p-4">${repair.mileage} km</span>
                                    </button>
                                </li>`)

        return repairListHtml;
    }

    private eventListeners() {
        const deleteCarBtn = this.carDetailsPage.querySelector('.js-delete-car') as HTMLButtonElement;
        const selectRepairItems = this.carDetailsPage.querySelectorAll('.js-repair-item') as NodeListOf<HTMLButtonElement>
        const deleteAllBtn = this.carDetailsPage.querySelector('.js-delete-all-btn') as HTMLButtonElement;
        const editBtn = this.carDetailsPage.querySelector('.js-edit') as HTMLButtonElement;

        deleteCarBtn.addEventListener('click', () => this.handleDeleteCar())
        selectRepairItems.forEach(button =>
            button.addEventListener('click', (ev) => this.select(ev))
        )
        deleteAllBtn.addEventListener('click', () => this.handleDeleteAll())
        editBtn.addEventListener('click', () => this.handleEdit())
    }

    private select(ev: MouseEvent) {
        ev.preventDefault();
        const btn = ev.currentTarget as HTMLButtonElement;

        this.routing.goRepairInfo(this.car.id, btn.dataset.id);
    }

    private handleDeleteCar() {
        this.carService.deleteCar(this.car).then(() => this.routing.goBack());
    }

    private handleDeleteAll() {
        const repairsId = this.pageHelper.getCheckedItems()

        repairsId.forEach(item => this.pageHelper.preDeleteItem(item))

        this.carService.deleteRepairs(this.car, repairsId).then(isDeleted => {
            if (isDeleted) {
                repairsId.forEach(item => this.pageHelper.deleteItem(item))
            }
            this.pageHelper.uncheckMainCheckbox();
        });
    }

    private handleEdit() {
        this.routing.goMenageCar(this.car);
    }
}