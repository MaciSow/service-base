import {addIcons, formatAmount} from "../utilities";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {Repair} from "../model/Repair";
import {Part} from "../model/Part";
import {RepairInfo} from "./RepairInfo";
import * as Dropzone from "dropzone";
import {Modal} from "./Modal";

export class MenagePart {
    private carService: CarService;
    private repairInfo: RepairInfo;
    private routing: Routing;
    private repair: Repair;
    private part: Part;
    private uploadedInvoice = '';
    private isEdit = false;
    private isImageDelete = false;

    constructor(part: Part, repairId: string, routing: Routing, carService: CarService, repairInfo: RepairInfo) {
        this.part = part;
        this.carService = carService;
        this.repairInfo = repairInfo;
        this.routing = routing;
        this.isEdit = part !== null;

        carService.getRepair(repairId).then(repair => {
            this.repair = repair;

            this.init();
        })
    }

    private init() {
        this.createWindow();
        this.insertInvoiceDelete();
        this.handleUpload();
        this.eventListeners();
        addIcons();
    }

    private createWindow() {
        const title = this.isEdit ? 'Edit Part' : 'Add New Part';

        const menageHTML =
        `
        <form id="menageRepair" class="l-manage-part js-form">
            <div class="o-field">
                <label class="o-field__label" for="formPart">Part/Service:</label>
                <input class="o-field__input" type="text" name="part" id="formPart" required ${this.insertValue('name')}>
            </div>
            <div class="o-field">
                <label class="o-field__label" for="formModel">Model/Firm:</label>
                <input class="o-field__input" type="text" name="model" id="formModel" ${this.insertValue('model')}>
            </div>
            <div class="content__group">
                <div class="o-field">
                    <label class="o-field__label" for="formPrice">Price:</label>
                    <input class="o-field__input--money" type="text" name="price" id="formPrice" placeholder="0.00" ${this.insertValuePrice()}>
                    <span class="o-postfix">$</span>
                </div>
                <div class="o-field">
                   <label class="o-field__label" for="formInvoice">Invoice/Receipt:</label>
                   <div id="add-invoice" class="o-btn-dropzone dropzone js-dropzone" ></div> 
                </div>
            </div>
            <div class="o-field u-d-flex-top">
                <label class="o-field__label" for="formNotice">Notice:</label>
                <textarea class="o-field__input " rows="3" maxlength="250"  type="text" name="notice" id="formNotice" >${this.isEdit ? this.part.notice : ''}</textarea>
            </div>
            <div class="u-flex-r">
                <button class="o-btn-form js-save">Save</button>      
            </div>  
            <div class="l-drop-down-backdrop u-is-hidden u-hide js-drop-down-backdrop"></div>                                      
        </form>
        `;

        new Modal(title, menageHTML);
    }

    private eventListeners() {
        const btnInvoiceDelete = document.querySelector('.js-invoice-delete');
        const form = document.querySelector('.js-form') as HTMLFormElement;

        form.onsubmit = async (ev) => this.handleSubmit(ev);
        btnInvoiceDelete.addEventListener('click', () => this.handleInvoiceDelete());
    }

    private handleSubmit(ev: Event) {
        ev.preventDefault();
        const form = ev.currentTarget as HTMLFormElement;
        const data = new FormData(form)

        if (this.isEdit) {
            this.part.editFromForm(data)

            if (this.uploadedInvoice || this.isImageDelete) {
                this.part.invoice = this.uploadedInvoice;
            } else {
                const invoiceLink = this.part.invoice ? this.part.invoice.split('/') : '';
                this.part.invoice = invoiceLink[invoiceLink.length - 1];
            }

            this.carService.editPart(this.part, this.repair).then(() => {
                this.hideWindow().then();
                this.repairInfo.update(this.repair);
            })
        } else {
            const part = Part.createFromForm(data)
            part.invoice = this.uploadedInvoice;

            this.carService.addPart(part, this.repair).then(() => {
                this.hideWindow().then();
                this.repairInfo.update(this.repair);
            })
        }
    }

    private handleUpload() {
        this.dropzoneSettings();

        const myDropzone = new Dropzone("#add-invoice", {url: "https://service-base-api.es3d.pl/upload-image"});

        myDropzone.on('success', (data, uploadedInvoice) => {
            const fileName = document.querySelector('.dz-filename') as HTMLDivElement
            fileName.style.opacity = '1';
            this.uploadedInvoice = uploadedInvoice;
            this.refreshSubmit()
        });
        myDropzone.on('addedfile', () => this.refreshSubmit(false));
        myDropzone.on('removedfile', () => this.uploadedInvoice = null);
    }

    private handleInvoiceDelete() {

        const btnTxt = document.querySelector('.js-dropzone .dz-button') as HTMLButtonElement;
        const deleteBtn = document.querySelector('.js-invoice-delete') as HTMLButtonElement;

        this.isImageDelete = true;
        deleteBtn.classList.add('u-hide');
        btnTxt.innerText = 'Add file';
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

    private dropzoneSettings() {
        const ico = `
            <svg viewBox="0 0 32 32" class="o-ico">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M31.4127 0.589608C31.5989 0.775339 31.7466 0.99598 31.8474 1.23889C31.9482 1.48181 32.0001 1.74222 32.0001 2.00521C32.0001 2.26821 31.9482 2.52862 31.8474 2.77153C31.7466 3.01445 31.5989 3.23509 31.4127 3.42082L3.42047 31.413C3.04503 31.7884 2.53582 31.9994 2.00487 31.9994C1.47391 31.9994 0.964703 31.7884 0.589261 31.413C0.21382 31.0376 0.00289917 30.5283 0.00289917 29.9974C0.00289917 29.4664 0.21382 28.9572 0.589261 28.5818L28.5814 0.589608C28.7672 0.403407 28.9878 0.255677 29.2307 0.154879C29.4736 0.0540812 29.7341 0.00219727 29.997 0.00219727C30.26 0.00219727 30.5205 0.0540812 30.7634 0.154879C31.0063 0.255677 31.2269 0.403407 31.4127 0.589608V0.589608Z"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.589211 0.589608C0.403011 0.775339 0.25528 0.99598 0.154482 1.23889C0.0536845 1.48181 0.00180054 1.74222 0.00180054 2.00521C0.00180054 2.26821 0.0536845 2.52862 0.154482 2.77153C0.25528 3.01445 0.403011 3.23509 0.589211 3.42082L28.5814 31.413C28.9568 31.7884 29.466 31.9994 29.997 31.9994C30.528 31.9994 31.0372 31.7884 31.4126 31.413C31.788 31.0376 31.999 30.5283 31.999 29.9974C31.999 29.4664 31.788 28.9572 31.4126 28.5818L3.42042 0.589608C3.23469 0.403407 3.01405 0.255677 2.77114 0.154879C2.52822 0.0540813 2.26781 0.00219727 2.00482 0.00219727C1.74182 0.00219727 1.48141 0.0540813 1.2385 0.154879C0.995583 0.255677 0.774942 0.403407 0.589211 0.589608Z"/>
            </svg>
        `

        Dropzone.options.addInvoice = {
            paramName: "invoice",
            createImageThumbnails: false,
            acceptedFiles: 'image/*, application/pdf',
            maxFiles: 1,
            dictDefaultMessage: this.isEdit && this.part.invoice ? 'Change file' : 'Add file',
            addRemoveLinks: true,
            dictCancelUpload: ico,
            dictRemoveFile: ico,
            headers: {
                'Cache-Control': null,
                'X-Requested-With': null
            }
        }
    }

    private refreshSubmit(unlock = true) {
        const submitBtn = document.querySelector('.js-save') as HTMLButtonElement;

        if (unlock) {
            submitBtn.removeAttribute("disabled");
        } else {
            submitBtn.setAttribute("disabled", "true");
        }
    }

    private insertValue(property: string): string {
        let value = '';

        if (this.part && this.part[property]) {
            value = this.part[property];
        }

        return value ? 'value="' + value + '"' : '';
    }

    private insertValuePrice(): string {
        let value = '';

        if (this.part && this.part.price) {
            value = formatAmount(this.part.price);
        }

        return value ? 'value="' + value + '"' : '';
    }

    private insertInvoiceDelete() {
        const dropzone = document.querySelector('.js-dropzone') as HTMLDivElement;

        const deleteBtn =
            `
            <button type="button" class="o-btn-dropzone__delete js-invoice-delete ${this.isEdit && this.part.invoice ? '' : 'u-hide'}"><i class="ico Xdelete"></i></button>
            `
        dropzone.insertAdjacentHTML('beforeend', deleteBtn);

    }
}