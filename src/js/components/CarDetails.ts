import {Car} from "../model/Car";
import {addIcons, getStringDate} from "../utilities";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {Part} from "../model/Part";

export class CarDetails {
    car: Car;
    private carService: CarService;
    private routing: Routing;
    private carDetailsPage: HTMLDivElement;
    private repairList: HTMLOListElement;
    private btnDeleteAll: HTMLButtonElement;

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
            this.repairList = this.carDetailsPage.querySelector('.js-repairs');
            this.btnDeleteAll = this.carDetailsPage.querySelector('.js-delete-all-btn');
            this.clickListener();
            this.handleCheck();
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
            repairListHtml += `<li class="c-list__item">
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

    private setMainCheckbox(current: boolean, checkboxes: NodeListOf<HTMLInputElement>) {
        const checkboxMain = this.carDetailsPage.querySelector('.js-checkbox-main') as HTMLInputElement;
        if (!current) {
            checkboxMain.checked = false;
            return;
        }

        let allIsChecked = true;
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allIsChecked = false;
                return;
            }
        })
        checkboxMain.checked = allIsChecked;
    }

    private handleCheck() {
        const checkboxes = this.carDetailsPage.querySelectorAll('.js-checkbox') as NodeListOf<HTMLInputElement>;
        const checkboxMain = this.carDetailsPage.querySelector('.js-checkbox-main') as HTMLInputElement;

        checkboxMain.addEventListener('change', (ev) => {
            const target = ev.target as HTMLInputElement;
            const checkboxes = this.carDetailsPage.querySelectorAll('.js-checkbox') as NodeListOf<HTMLInputElement>;
            checkboxes.forEach(checkbox => checkbox.checked = target.checked)

            this.toggleDeleteAllBtn()
        });

        checkboxes.forEach(checkbox =>
            checkbox.addEventListener('change', () => {
                this.setMainCheckbox(checkbox.checked, checkboxes)
                this.toggleDeleteAllBtn()
            }))
    }

    private toggleDeleteAllBtn() {
        const length = this.getCheckedRepairs().length;

        if (length > 1) {
            this.btnDeleteAll.classList.remove('u-hide');
            return;
        }
        this.btnDeleteAll.classList.add('u-hide');
    }

    private getCheckedRepairs(): Part[] {
        const repairs = Array.from(this.repairList.children);
        const checkedParts = [];

        repairs.forEach((repair: HTMLLIElement) => {
            const checkbox = repair.querySelector('input[type="checkbox"]') as HTMLInputElement
            if (checkbox.checked) {
                checkedParts.push(this.car.repairs.find(item => item.id === +repair.dataset.id));
            }
        })
        return checkedParts;
    }
}