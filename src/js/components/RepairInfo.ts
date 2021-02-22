import {Car} from "../model/Car";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {addIcons, clearListeners, formatAmount, getParValueFromUrl, getStringDate} from "../utilities";
import {Repair} from "../model/Repair";
import {PageHelper} from "../services/PageHelper";
import {Modal} from "./Modal";
import {Part} from "../model/Part";
import {ConnectPart} from "../model/ConnectPart";

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
            this.pageHelper.handleCheck(this.updateFooter.bind(this), this.repair.parts);
            addIcons();
        })
    }

    public eventListeners() {
        const deleteRepairBtn = this.repairInfoPage.querySelector('.js-delete-repair') as HTMLButtonElement;
        const deletePartButtons = this.repairInfoPage.querySelectorAll('.js-delete-part') as NodeListOf<HTMLButtonElement>;
        const editPartButtons = this.repairInfoPage.querySelectorAll('.js-edit-part') as NodeListOf<HTMLButtonElement>;
        const deleteAllBtn = this.repairInfoPage.querySelector('.js-delete-all-btn') as HTMLButtonElement;
        const connectPartBtn = this.repairInfoPage.querySelector('.js-connect-btn') as HTMLButtonElement;
        const disconnectPartBtn = this.repairInfoPage.querySelector('.js-disconnect-btn') as HTMLButtonElement;
        const editBtn = this.repairInfoPage.querySelector('.js-edit') as HTMLButtonElement;
        const invoicePartButtons = this.repairInfoPage.querySelectorAll('.js-invoice-part') as NodeListOf<HTMLButtonElement>;
        const noticePartButtons = this.repairInfoPage.querySelectorAll('.js-notice-part') as NodeListOf<HTMLButtonElement>;

        deleteRepairBtn.addEventListener('click', () => this.handleDeleteRepair())
        deleteAllBtn.addEventListener('click', () => this.handleDeleteAll())
        connectPartBtn.addEventListener('click', () => this.handleConnectPart())
        disconnectPartBtn.addEventListener('click', () => this.handleDisconnectPart())
        deletePartButtons.forEach(part =>
            part.addEventListener('click', (ev) => this.handleDeletePart(ev))
        );
        editPartButtons.forEach(part =>
            part.addEventListener('click', (ev) => this.handleEditPart(ev))
        );
        editBtn.addEventListener('click', () => this.handleEdit())
        invoicePartButtons.forEach(part =>
            part.addEventListener('click', (ev) => this.handleInvoicePart(ev))
        );
        noticePartButtons.forEach(part =>
            part.addEventListener('click', (ev) => this.handleNoticePart(ev))
        );

    }

    private handleEdit() {
        this.routing.openMenageRepair(this.repair, this.car)
    }

    private handleDeleteRepair() {
        this.carService.deleteRepair(this.repair).then(() => this.routing.goBack());
    }

    private handleEditPart(ev: MouseEvent) {
        const target = ev.target as HTMLElement
        const partId = target.closest('li').dataset.id;
        const part = this.repair.getPart(partId);

        this.routing.openMenagePart(part, this.repair);
    }

    private handleDeletePart(ev: MouseEvent) {
        const target = ev.target as HTMLElement
        const part = target.closest('li') as HTMLLIElement;
        const partId = part.dataset.id;

        this.pageHelper.preDeleteItem(partId);
        this.carService.deletePart(this.repair, partId).then(isDeleted => {
            if (isDeleted) {
                this.pageHelper.deleteItem(partId, () => {
                    this.updateLonelyConnect();
                });
            }
        });
    }

    private updateLonelyConnect() {
        const promises = [];
        const partsToUpdate = this.getLonelyConnect();

        partsToUpdate.forEach(part => {
            part.invoice = '';
            part.connect = null;
            promises.push(this.carService.editPart(part, this.repair));
        })

        Promise.all(promises).then(() => {
            this.update(this.repair);
        });
    }

    private handleDeleteAll() {
        const partsId = this.pageHelper.getCheckedItems()

        partsId.forEach(item => this.pageHelper.preDeleteItem(item))

        this.carService.deleteParts(this.repair, partsId).then(isDeleted => {
            if (isDeleted) {
                partsId.forEach((item, index) => this.pageHelper.deleteItem(item, () => {
                    if (partsId.length === index + 1) {
                        this.updateLonelyConnect();
                    }
                }))
            }
        });
    }

    private handleConnectPart() {
        const parts = this.getSelectedParts();
        const connectType = this.pageHelper.getConnectType(parts);

        switch (connectType) {
            case 1:
                this.createConnectPartsModal(parts);
                const form = document.querySelector('.js-connect-parts-form') as HTMLFormElement;
                form.onsubmit = async (ev) => this.handleSubmit(ev);
                return
            case 2:
                this.expandConnectPart(parts);
                break;
            case 3:
                this.groupConnectPart(parts);
                break;
        }

        this.update(this.repair);
    }

    private handleDisconnectPart() {
        const parts = this.getSelectedParts();
        let partsToUpdate = [];
        let promises = [];

        parts.forEach(part => {
            part.connect = null;
            partsToUpdate.push(part);
        })

        partsToUpdate = [...partsToUpdate, ...this.getLonelyConnect()];

        partsToUpdate.forEach(part => {
            part.invoice = '';
            part.connect = null;
            promises.push(this.carService.editPart(part, this.repair));
        })

        Promise.all(promises).then(() => {
            this.update(this.repair);
        });
    }

    private getLonelyConnect(): Part[] {
        const connectParts = this.repair.parts.filter(part => part.connect !== null)
        const partsToUpdate: Part[] = []

        connectParts.forEach(part => {
            const isntLonely = connectParts.reduce((a, b) => part.connect.toString() === b.connect.toString() ? a += 1 : a, -1)
            if (!isntLonely) {
                partsToUpdate.push(part);
            }
        });

        return partsToUpdate;
    }

    private handleInvoicePart(ev: MouseEvent) {
        const part = this.getPartFromList(ev)
        const content =
            `
            <a href="${part.invoice}" target="_blank">
            <img class="c-modal__body--image u-mt--sm" src="${part.invoice}" alt="any invoice :c">
            </a>
`

        new Modal('Invoice', content);
    }

    private handleNoticePart(ev: MouseEvent) {
        const part = this.getPartFromList(ev)
        const content =
            `
            <div class="c-modal__body--text u-mt--sm">
            ${part.notice}
            </div>
            `

        new Modal('Notice', content);
    }

    private handleSubmit(ev: Event) {
        ev.preventDefault();

        const form = ev.currentTarget as HTMLFormElement;
        const data = new FormData(form)
        const connectType = data.get('connectType').toString();
        const preserveInvoice = data.get('invoice') ? data.get('invoice').toString() : '';

        const parts = this.getSelectedParts();
        const connectId = ConnectPart.generateId();

        const maxPrice = parts.reduce((a, b) => b.price > a ? a = b.price : a, 0);

        parts.forEach(part => {
            part.connect = new ConnectPart(connectId, connectType === 'price');
            part.invoice = preserveInvoice;

            if (part.connect.priceShare) {
                part.price = maxPrice;
            }
            this.carService.editPart(part, this.repair).then()
        })

        this.update(this.repair);
        Modal.hideWindow().then(() => {
        })
    }

    private fillWindow() {
        let carHtml = this.createWindow();
        this.repairInfoPage.insertAdjacentHTML("beforeend", carHtml)
        this.fillPartList();
    }

    private fillPartList() {
        const partList = document.querySelector('.js-parts') as HTMLOListElement;
        let finalList = this.repair.parts;

        let repairListHtml = '';
        let previousConnectionId = '---';
        let previousGroupId: number = null;
        ConnectPart.sort(finalList);

        finalList.forEach((part) => {
            let showInvoice = true;
            let connectClass = '';
            let price = formatAmount(part.price) + ' $';
            let separator = '';

            if (part.connect) {
                showInvoice = previousConnectionId !== part.connect.id;
                previousConnectionId = part.connect.id ?? '---';

                if (!showInvoice && part.connect.priceShare) {
                    price = '';
                }

                if (part.connect.groupId) {

                    if (part.connect.groupId === previousGroupId) {
                        price = '';

                    } else if (part.connect.groupId) {
                        separator = 'separate';
                    }

                    previousGroupId = part.connect.groupId;
                }

                if (part.connect.priceShare) {
                    connectClass = 'connect-price';
                } else {
                    connectClass = part.connect.groupId ? 'connect-group' : 'connect-invoice';
                }

                connectClass += showInvoice ? ' u-bt-solid' : ''
            }

            repairListHtml += `<li class="c-list__item u-col-parts" data-id="${part.id}">
                                    <div class="item__col ">
                                        <label class="o-checkbox">
                                            <input class="o-checkbox__input js-checkbox" type="checkbox">
                                            <span class="o-checkbox__checkmark"></span>
                                        </label>
                                    </div>
                             
                                    <div class="item__col ${connectClass} ${separator}">${part.name}</div>
                                    <span class="item__col ${connectClass}">${part.model}</span>
                                    <span class="item__col u-text--right ${connectClass}">${price}</span>
                                    <div class="item__col u-d-flex-center ${connectClass}">        
                                        <button class="o-btn-ico u-mr--sx js-invoice-part ${showInvoice ? '' : 'u-transparent'} " ${showInvoice && part.invoice ? '' : 'disabled'}><i class="ico invoice"></i></button>
                                        <button class="o-btn-ico u-ml--sx js-notice-part" ${part.notice ? '' : 'disabled'}><i class="ico notice"></i></button>
                                    </div>
                                    <div class="item__col u-d-flex-center">
                                        <button class="o-btn-ico u-mr--sx js-edit-part"><i class="ico edit"></i></button>
                                        <button class="o-btn-ico u-ml--sx js-delete-part"><i class="ico delete"></i></button>
                                    </div>
                                </li>`
        })

        partList.innerHTML = repairListHtml;
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
                        <span class="u-mw--m">delete</span>
                    </button>                    
                    <button class="o-btn u-hide js-connect-btn">
                        <i class="ico add"></i>
                        <span class="o-btn__title js-connect-btn-title">connect</span>
                    </button>
                    <button class="o-btn--warning u-mr--sm u-hide js-disconnect-btn">
                        <i class="ico Xdelete"></i>
                        <span class="o-btn__title">disconnect</span>
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
                    <span class="u-p-4 u-pl-38">Part/Service</span>
                    <span class="u-p-4">Model/Firm</span>
                    <span class="u-p-4">Price</span>
                    <span class="u-p-4">Show</span>
                    <span class="u-p-4">Actions</span>
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

    private createNotice(): string {
        if (!this.repair.notice) {
            return '';
        }
        return `<div class="content__notice">
                <span class="u-txt-b">Notice:</span>
                <p class="u-mt--xs">${this.repair.notice}</p>
             </div>`
    }

    private createConnectPartsModal(parts: Part[]) {
        let invoicesList = '';
        let isChecked = false;

        parts.forEach((part, index) => {
            let value = '';
            if (!part.invoice) {
                return;
            }

            if (!isChecked && part.invoice) {
                value = 'checked';
                isChecked = true;
            }

            invoicesList +=
                `
                <div class="connect__input">
                  <input class="o-field__input-radio" type="radio" id="${part.id}" name="invoice" value="${part.invoice}"${value}>
                  <label class="o-field__label" for="${part.id}">${part.name}</label>
                </div>
                `
        })

        const content =
            `
            <form class="c-modal__body--connect js-connect-parts-form">
                <p class="connect__header" >Select connection type:</p>
                
                <div class="connect__input">
                  <input class="o-field__input-radio" type="radio" id="invoice" name="connectType" value="invoice" checked>
                  <label class="o-field__label" for="invoice">Invoice</label>
                </div>
                <div class="connect__input">
                  <input class="o-field__input-radio" type="radio" id="twice" name="connectType" value="price">
                  <label class="o-field__label" for="twice">Invoice & Price</label>
                </div>            
                
                ${invoicesList ? '<p class="connect__header">Select invoice from:</p>' + invoicesList : ''}
          
                
                <div class="u-flex-r">
                   <button class="o-btn-form js-save">Connect</button>      
                </div>  
            </form>
`
        new Modal('Connect Parts', content);
    }

    private refreshFooter(sum: number = this.repair.costsSum(), amount: number = this.repair.parts.length) {
        const sumHTML = this.repairInfoPage.querySelector('.js-sum');
        const amountHTML = this.repairInfoPage.querySelector('.js-amount');

        sumHTML.innerHTML = `${formatAmount(sum)} $`;
        amountHTML.innerHTML = `Amount: ${amount}`;
    }

    private updateFooter() {
        let checkedPartsId = this.pageHelper.getCheckedItems();
        let checkedParts: Part[] = [];

        if (!checkedPartsId.length) {
            checkedParts = this.repair.parts;
        } else {
            checkedPartsId.forEach((id: string) => {
                checkedParts.push(this.repair.parts.find(item => item.id === id));
            })
        }

        this.refreshFooter(
            this.repair.costsSum(checkedParts),
            checkedParts.length
        )
    }

    public update(repair: Repair) {
        const btnDeleteAll = this.repairInfoPage.querySelector('.js-delete-all-btn') as HTMLButtonElement;
        const connectPartBtn = this.repairInfoPage.querySelector('.js-connect-btn') as HTMLButtonElement;
        const disconnectPartBtn = this.repairInfoPage.querySelector('.js-disconnect-btn') as HTMLButtonElement;
        const checkboxMain = this.repairInfoPage.querySelector('.js-checkbox-main') as HTMLInputElement;

        this.pageHelper.uncheckMainCheckbox();
        this.pageHelper.uncheckCheckboxes();
        this.pageHelper.hideDeleteAllBtn();
        this.pageHelper.hideConnectBtn();
        this.pageHelper.hideDisonnectBtn();

        clearListeners(btnDeleteAll);
        clearListeners(connectPartBtn);
        clearListeners(disconnectPartBtn);
        checkboxMain.checked = false;
        this.repair = repair;


        this.fillPartList();
        this.refreshFooter();

        this.eventListeners();
        this.pageHelper = new PageHelper('js-parts');
        this.pageHelper.handleCheck(this.updateFooter.bind(this), this.repair.parts);

        addIcons()
    }

    private getPartFromList(ev: MouseEvent): Part {
        const target = ev.target as HTMLElement
        const partHTML = target.closest('li') as HTMLLIElement;
        const partId = partHTML.dataset.id;
        return this.repair.getPart(partId);
    }

    private groupConnectPart(parts: Part[]) {
        const maxPrice = parts.reduce((a, b) => b.price > a ? a = b.price : a, 0);
        const groupId = ConnectPart.getNextGroupId(this.repair.parts, parts[0].connect.id);

        parts.forEach(part => {
            part.connect.groupId = groupId;
            part.price = maxPrice;

            this.carService.editPart(part, this.repair).then()
        })
    }

    private expandConnectPart(parts: Part[]) {
        const connectPart = parts.find(part => part.connect);
        const connectString = connectPart.connect.toString();

        if (connectPart.connect.priceShare || connectPart.connect.groupId) {
            parts.forEach(part => part.price = connectPart.price)
        }

        parts.forEach(part => {
            part.invoice = connectPart.invoice;
            part.connect = ConnectPart.createFromString(connectString);

            this.carService.editPart(part, this.repair).then()
        })
    }

    private getSelectedParts(): Part[] {
        const partsId = this.pageHelper.getCheckedItems()
        return partsId.map((id) => this.repair.getPart(id));
    }
}