import {addIcons, getStringDate} from "../utilities";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {Repair} from "../model/Repair";
import {Part} from "../model/Part";
import {RepairInfo} from "./RepairInfo";

export class MenagePart {
    private carService: CarService;
    private repairInfo: RepairInfo;
    private routing: Routing;
    private repair: Repair;

    constructor(repairId: string, routing: Routing, carService: CarService, repairInfo: RepairInfo) {
        this.carService = carService;
        this.repairInfo = repairInfo;
        this.routing = routing;
        carService.getRepair(repairId).then(repair => {
            this.repair = repair;
            this.init();
        })
    }

    private init() {
        this.createWindow()

        this.eventListeners();
        addIcons();
    }

    private createWindow() {
        const body = document.querySelector('body');

        const now = getStringDate(new Date(), '-', true);

        const menageHTML = `<div class="c-modal-backdrop u-is-showing js-menage-window">          
                                <div class="c-modal">
                                    <button class="o-btn-ico--delete c-modal__close js-menage-close"><i class="ico Xdelete"></i></button>
                                    <h2 class="o-title-l1--center">Add New Part</h2>
                                    <form id="menageRepair" class="l-manage-part js-form">
                                        <div class="o-field">
                                            <label class="o-field__label" for="formPart">Part/Service:</label>
                                            <input class="o-field__input" type="text" name="part" id="formPart" required>
                                        </div>
                                        <div class="o-field">
                                            <label class="o-field__label" for="formModel">Model/Firm:</label>
                                            <input class="o-field__input" type="text" name="model" id="formModel">
                                        </div>
                                        <div class="content__group">
                                            <div class="o-field">
                                                <label class="o-field__label" for="formPrice">Price:</label>
                                                <input class="o-field__input--money" type="text" name="price" id="formPrice" placeholder="0.00">
                                                <span class="o-postfix">$</span>
                                            </div>
                                            <div class="o-field">
                                               <label class="o-field__label" for="formInvoice">Invoice/Receipt:</label>
                                               <button class="o-btn-form ">Add Invoice/Receipt</button> 
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
        this.showWindow();
    }

    private eventListeners() {
        const btnClose = document.querySelector('.js-menage-close');
        const form = document.querySelector('.js-form') as HTMLFormElement;

        form.onsubmit = async (ev) => this.handleSubmit(ev);
        btnClose.addEventListener('click', () => this.handleClose());
    }

    private handleClose() {
        this.hideWindow().then();
    }

    private handleSubmit(ev: Event) {
        ev.preventDefault();

        const form = ev.currentTarget as HTMLFormElement;
        const data = new FormData(form)
        const part = Part.createFromForm(data)

        this.carService.addPart(part, this.repair).then(() => {
            this.hideWindow().then();

            this.repairInfo.update(this.repair);
            addIcons();
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
}