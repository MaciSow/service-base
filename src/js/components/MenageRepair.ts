import {addIcons, getStringDate} from "../utilities";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {Car} from "../model/Car";
import {Repair} from "../model/Repair";

export class MenageRepair {
    private carService: CarService;
    private routing: Routing;
    private car: Car;

    constructor(carId: string, routing: Routing, carService: CarService) {
        this.carService = carService;
        this.routing = routing;
        this.car = this.carService.getCar(carId);
        this.init();
    }

    private init() {
        this.createWindow()

        this.eventListeners();
        addIcons();
    }

    private createWindow() {
        const body = document.querySelector('body');

        const now = getStringDate( new Date(),'-',true);
        
        const menageHTML = `<div class="c-modal-backdrop u-is-showing js-menage-window">          
                                <div class="c-modal">
                                    <button class="o-btn-ico--delete c-modal__close js-menage-close"><i class="ico Xdelete"></i></button>
                                    <h2 class="o-title-l1--center">Add New Repair</h2>
                                    <form id="menageRepair" class="l-manage-repair js-form">
                                        ${this.createDropList()}
                                        <div class="o-field">
                                            <label class="o-field__label" for="formTitle">Title:</label>
                                            <input class="o-field__input" type="text" name="title" id="formTitle" required>
                                        </div>
                                        <div class="content__group">
                                            <div class="o-field">
                                                <label class="o-field__label" for="formDate">Date:</label>
                                                <input class="o-field__input--date" type="date" name="date" id="formDate" value="${now}">
                                            </div>
                                            <div class="o-field">
                                                <label class="o-field__label" for="formMileage">Mileage:</label>
                                                <input class="o-field__input u-pr--la" min="0" type="number" name="mileage" id="formMileage">
                                                <span class="o-postfix">km</span>
                                            </div>
                                        </div>
                                        <div class="o-field u-d-flex-top">
                                            <label class="o-field__label" for="formNotice">Notice:</label>
                                            <textarea class="o-field__input " rows="3"   type="text" name="notice" id="formNotice"></textarea>
                                        </div>
                                        <div class="u-flex-r">
                                            <button class="o-btn-form js-save">Save</button>      
                                        </div>  
                                        <div class="l-drop-down-backdrop u-is-hidden u-hide js-drop-down-backdrop"></div>                                      
                                    </form>
                                </div>
                           </div>`;

        body.insertAdjacentHTML('beforeend', menageHTML);

        this.fillDropDown();
        this.showWindow();
    }

    private createDropList() {
        return `
<div class="c-drop-down js-drop-down">
    <span class="c-drop-down__label">Select car:</span>
    <div class="c-drop-down__image-frame">
        <i class="ico car"></i>
        <img class="image-frame__image js-drop-down-image" src="${this.car.image}" alt="">                                     
    </div>
    <span class="c-drop-down__title js-drop-down-title">${this.car.fullName()}</span>
    <ul class="c-drop-down__list js-drop-down-list"></ul>
</div>`
    }

    private eventListeners() {
        const btnClose = document.querySelector('.js-menage-close');
        const dropDown = document.querySelector('.js-drop-down');
        const form = document.querySelector('.js-form') as HTMLFormElement;

        form.onsubmit = async (ev) => this.handleSubmit(ev);
        btnClose.addEventListener('click', () => this.handleClose());
        dropDown.addEventListener('click', () => this.handleDropDown(form));
    }

    private handleClose() {
        this.hideWindow().then();
    }

    private handleSubmit(ev: Event) {
        ev.preventDefault();

        const form = ev.currentTarget as HTMLFormElement;
        const data = new FormData(form)

        const repair = Repair.createFromForm(data)
        this.carService.addRepair(repair, this.car).then(() => {

            this.routing.goRepairInfo(this.car.id, repair.id)
            this.hideWindow().then(() => {
            })
        })
    }

    private showWindow() {
        const window = document.querySelector('.js-menage-window');

        setTimeout(() => {
            window.classList.remove('u-is-showing');
        }, 250);
    }

    private hideWindow(): Promise<null> {
        return new Promise((resolve) => {
            const window = document.querySelector('.js-menage-window');
            window.classList.add('u-is-hidden');
            setTimeout(() => {
                window.remove();
                resolve();
            }, 250);
        });
    }

    private handleDropDown(form: HTMLFormElement) {
        const dropDownList = document.querySelector('.js-drop-down-list');
        const backdrop = form.querySelector('.js-drop-down-backdrop')

        if (dropDownList.classList.contains('u-show')) {
            dropDownList.classList.remove('u-show');

            backdrop.classList.remove('u-is-showing');
            backdrop.classList.add('u-is-hidden');
            setTimeout(() => backdrop.classList.add('u-hide'), 250);
        } else {
            dropDownList.classList.add('u-show');

            backdrop.classList.remove('u-is-hidden');
            backdrop.classList.remove('u-hide');
            backdrop.classList.add('u-is-showing');
        }
    }

    private handleListItem(ev) {
        const title = document.querySelector('.js-drop-down-title') as HTMLSpanElement;
        const image = document.querySelector('.js-drop-down-image') as HTMLImageElement;
        const carId = ev.target.closest('li').dataset.id;
        this.car = this.carService.getCar(carId);

        image.src = this.car.image;
        title.innerText = this.car.fullName();

        setTimeout(() => this.fillDropDown(), 250)
    }

    private fillDropDown() {
        const list = document.querySelector('.js-drop-down-list') as HTMLUListElement;
        let carsHTML = '';

        this.carService.getCars().forEach((car: Car) => {
            if (car === this.car) {
                return;
            }

            carsHTML += `
<li class="list__item js-list__item" data-id="${car.id}">
    <div class="o-avatar">
        <i class="ico car"></i>
        <img class="o-avatar__image" src="${car.image}" alt="">                                     
    </div>
    <span class="u-ml--sm">${car.fullName()}</span>
</li>`
        })

        list.innerHTML = carsHTML;
        list.childNodes.forEach(item => item.addEventListener('click', (ev) => this.handleListItem(ev)));
    }
}