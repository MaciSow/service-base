import {Car} from "../model/Car";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {addIcons, clearListeners, formatAmount, getParValueFromUrl, getStringDate} from "../utilities";
import {Repair} from "../model/Repair";
import {PageHelper} from "../services/PageHelper";


export class RepairInfo {
    car: Car;
    repair: Repair;
    private carService: CarService;
    private routing: Routing;
    private repairInfoPage: HTMLDivElement;
    private pageHelper: PageHelper;


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

        const id = getParValueFromUrl('repair');

        this.carService.getRepairs(this.car).then(repairs => {
            this.car.repairs = repairs;
            this.repair = repairs.find(repair => repair.id === id);
            this.init();
        });
    }

    private init() {
        this.routing.setBack('/', 'js-repair-info', 'js-car-details');
        document.title = `Repair Info - ${this.repair.title}`;

        this.carService.getParts(this.repair).then(parts => {
            this.repair.parts = parts;
            this.fillWindow();
            this.eventListeners();
            this.pageHelper = new PageHelper('js-parts');
            this.pageHelper.handleCheck(this.updateFooter.bind(this));
            addIcons();
        })
    }

    public eventListeners() {
        const deleteRepairBtn = this.repairInfoPage.querySelector('.js-delete-repair') as HTMLButtonElement;
        const deletePartButtons = this.repairInfoPage.querySelectorAll('.js-delete-part') as NodeListOf<HTMLButtonElement>;
        const editPartButtons = this.repairInfoPage.querySelectorAll('.js-edit-part') as NodeListOf<HTMLButtonElement>;
        const deleteAllBtn = this.repairInfoPage.querySelector('.js-delete-all-btn') as HTMLButtonElement;
        const editBtn = this.repairInfoPage.querySelector('.js-edit') as HTMLButtonElement;


        deleteRepairBtn.addEventListener('click', () => this.handleDeleteRepair())
        deleteAllBtn.addEventListener('click', () => this.handleDeleteAll())
        deletePartButtons.forEach(part =>
            part.addEventListener('click', (ev) => this.handleDeletePart(ev))
        );
        editPartButtons.forEach(part =>
            part.addEventListener('click', (ev) => this.handleEditPart(ev))
        );
        editBtn.addEventListener('click', () => this.handleEdit())
    }

    private handleEditPart(ev: MouseEvent) {
        const target = ev.target as HTMLElement
        const partId = target.closest('li').dataset.id;
        const part = this.repair.getPart(partId);

        this.routing.openMenagePart(part,this.repair);
    }

    private handleDeletePart(ev: MouseEvent) {
        const target = ev.target as HTMLElement
        const part = target.closest('li') as HTMLLIElement;
        const partId = part.dataset.id;

        this.pageHelper.preDeleteItem(partId);
        this.carService.deletePart(this.repair, partId).then(isDeleted => {
            if (isDeleted) {
                this.pageHelper.deleteItem(partId, () => this.refreshFooter());
            }
        });
    }

    private handleDeleteRepair() {
        this.carService.deleteRepair(this.repair).then(() => this.routing.goBack());
    }

    private handleDeleteAll() {
        const partsId = this.pageHelper.getCheckedItems()

        partsId.forEach(item => this.pageHelper.preDeleteItem(item))

        this.carService.deleteParts(this.repair, partsId).then(isDeleted => {
            if (isDeleted) {
                partsId.forEach((item, index) => this.pageHelper.deleteItem(item, () => {
                    this.pageHelper.uncheckMainCheckbox();

                    if (partsId.length === index + 1) {
                        this.refreshFooter()
                    }
                }))
            }
        });
    }

    private handleEdit() {
        this.routing.openMenageRepair(this.repair, this.car)
    }

    private fillWindow() {
        let carHtml = this.createWindow();
        this.repairInfoPage.insertAdjacentHTML("beforeend", carHtml)
        this.fillPartList();
    }

    private refreshFooter(sum: number = this.repair.costsSum(), amount: number = this.repair.parts.length) {
        const sumHTML = this.repairInfoPage.querySelector('.js-sum');
        const amountHTML = this.repairInfoPage.querySelector('.js-amount');

        sumHTML.innerHTML = `${formatAmount(sum)} $`;
        amountHTML.innerHTML = `Amount: ${amount}`;
    }

    private updateFooter() {
        let checkedPartsId = this.pageHelper.getCheckedItems();
        let checkedParts = [];
        if (!checkedPartsId.length) {
            checkedParts = this.repair.parts;
        } else {
            checkedPartsId.forEach((id: string) => {
                checkedParts.push(this.repair.parts.find(item => item.id === id));
            })
        }

        this.refreshFooter(
            checkedParts.reduce((sum, item) => sum += item.price, 0),
            checkedParts.length
        )
    }

    private createWindow(): string {
        let img = '';
        if (this.car.image) {
            img = `<img class="o-car-thumb__image" src="${this.car.image}" alt="no brum brum">`;
        }

        return ` <div class="l-repair-info">
            <button class="o-btn-ico--delete l-repair-info__delete-all js-delete-repair"><i class="ico Xdelete"></i></button>
            <div class="l-repair-info__header">
                <div class="o-car-thumb">
                 <i class="ico car"></i>
                 ${img}
                </div>
                <div class="header__info">
                    <h2 class="o-title-l1">${this.repair.title}</h2>
                    <div class="header__info-data">
                    <button class="o-btn-ico header__info-edit js-edit"><i class="ico edit"></i></button>
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
                <div class="l-repair-info__action">
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

                <div class="c-list-header u-col-parts">
                    <label class="o-checkbox">
                      <input class="o-checkbox__input  js-checkbox-main" type="checkbox">
                      <span class="o-checkbox__checkmark"></span>
                    </label>
                    <span>Part/Service</span>
                    <span>Model/Firm</span>
                    <span>Price</span>
                    <span>Files</span>
                    <span>Actions</span>
                </div> 
                <ol class="c-list js-parts"></ol>
                <div class="c-list-footer">
                    <span class="c-list-footer__left">Sum:</span>
                    <span class="u-text--right js-sum">${formatAmount(this.repair.costsSum())} $</span>
                    <span class="js-amount">Amount: ${this.repair.parts.length}</span>
                </div> 
            ${this.createNotice()}
            </div>
           
        </div>`;
    }

    private fillPartList() {
        const partList = document.querySelector('.js-parts') as HTMLOListElement;

        let repairListHtml = '';
        this.repair.parts.forEach(part =>
            repairListHtml += `<li class="c-list__item u-col-parts" data-id="${part.id}">
                                    <label class="o-checkbox">
                                        <input class="o-checkbox__input js-checkbox" type="checkbox">
                                        <span class="o-checkbox__checkmark"></span>
                                    </label>
                                    <span>${part.name}</span>
                                    <span>${part.model}</span>
                                    <span class="u-text--right">${formatAmount(part.price)} $</span>
                                    <div class="u-d-flex-center">        
                                        <button class="o-btn-ico u-mr--sx" ${part.invoice ? '' : 'disabled'}><i class="ico invoice"></i></button>
                                        <button class="o-btn-ico u-ml--sx" ${part.notice ? '' : 'disabled'}><i class="ico notice"></i></button>
                                    </div>
                                    <div class="u-d-flex-center">
                                        <button class="o-btn-ico u-mr--sx js-edit-part"><i class="ico edit"></i></button>
                                        <button class="o-btn-ico u-ml--sx js-delete-part"><i class="ico delete"></i></button>
                                    </div>
                                </li>`)

        partList.innerHTML = repairListHtml;
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

    public update(repair: Repair) {
        const btnDeleteAll = this.repairInfoPage.querySelector('.js-delete-all-btn') as HTMLButtonElement;
        const checkboxMain = this.repairInfoPage.querySelector('.js-checkbox-main') as HTMLInputElement;

        btnDeleteAll.classList.add('u-hide');
        clearListeners(btnDeleteAll);
        checkboxMain.checked = false;
        this.repair = repair;

        this.fillPartList();
        this.refreshFooter();

        this.eventListeners();
        this.pageHelper = new PageHelper('js-parts');
        this.pageHelper.handleCheck(this.updateFooter.bind(this));

        addIcons()
    }
}