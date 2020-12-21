import {addIcons} from "../utilities";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {Car} from "../model/Car";
import * as Dropzone from "dropzone";

export class MenageCar {
    private carService: CarService;
    private routing: Routing;
    private menageCarPage: HTMLDivElement;
    private uploadedImage = '';
    private isImageDelete = false;
    private submitUnlock = 0;
    private car: Car;
    private title: string;

    constructor(routing: Routing, carService: CarService, car: Car = null) {
        this.carService = carService;
        this.routing = routing;
        this.car = car;
        this.init();
    }

    private init() {
        this.menageCarPage = document.querySelector('.js-menage-car');
        this.routing.setBack('/', 'js-menage-car', 'js-menu-page');
        this.refreshSubmit();

        if (!this.menageCarPage) {
            return;
        }
        this.title = this.car ? `Edit Vehicle` : `Add New Vehicle`;
        document.title = this.title;
        this.fillWindow();
        this.eventListeners();
        this.handleUpload();
        addIcons();
    }

    private fillWindow() {
        let carHtml = this.createWindow();
        this.menageCarPage.insertAdjacentHTML("beforeend", carHtml)
        this.insertImage()
        this.fillBrandSelect();
        this.fillBodySelect();
        this.fillLayoutSelect();
    }

    private createWindow(): string {

        const currentYear = new Date().getFullYear();

        return ` 
            <div class="l-menage-car">          
                <h2 class="o-title-l1--center">${this.title}</h2>
                <form id="menageCar" class="l-menage-car__content">
                    <div id="add-image" class=" o-car-thumb dropzone js-image">
                           <i class="ico car"></i>
                    </div>     
                    <div>
                        <h3 class="o-title-l2--center">Body</h3>
                        <div class="content__form">
                            <div class="o-field">
                                <label class="o-field__label" for="formBrand">Brand:</label>
                                <select class="o-field__select js-brand-select" name="brand" id="formBrand"></select> 
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formModel">Model:</label>
                                 <input class="o-field__input" type="text" name="model" id="formModel" ${this.insertValue('model')} required>
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formBodyStyle">Body Style:</label>
                                <select class="o-field__select js-body-select" name="bodyStyle" id="formBodyStyle"></select>
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formVersion">Version:</label>
                                <input class="o-field__input" type="text" name="version" id="formVersion" ${this.insertValue('version')}>
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formYear">Year:</label>
                                <input class="o-field__input" min="1800" max="${currentYear + 1}" type="number" name="year" id="formYear" ${this.insertValue('year')}>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="o-title-l2--center">Deadlines</h3>
                        <div class="content__deadlines-form">
                            <div class="o-field">
                                <label class="o-field__label" for="formInsurance">Insurance:</label>
                                <input class="o-field__input--date u-width--184px" name="insurance" id="formInsurance" type="date">
                                <button class="o-btn-form u-width--m">More</button> 
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formOverview">Overview:</label>
                                <input class="o-field__input--date" type="date" name="overview" id="formOverview">
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formOilChange">Oil change:</label>
                                <button class="o-btn-form u-width--100">Add New Repair</button> 
                             </div>
                        </div>    
                    </div>
                    <div>
                        <h3 class="o-title-l2--center">Engine</h3>
                        <div class="content__form">
                            <div class="o-field">
                                <label class="o-field__label" for="formCapacity">Capacity:</label>
                                <input class="o-field__input" name="capacity" pattern="^\\d{1,2}\\.?\\d{1,3}" id="formCapacity" 
                                title="Invalid format, must be digit" type="text" ${this.insertValueEngine('capacity')}> 
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formName">Name:</label>
                                <input class="o-field__input" type="text" minlength="2" name="name" id="formName" ${this.insertValueEngine('name')}>
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formLayout">Layout:</label>
                                <select class="o-field__select js-layout-select" name="layout" size="1"></select>
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formPistons">Pistons:</label>
                                <input class="o-field__input" min="1" max="32" type="number" name="pistons" id="formPistons" ${this.insertValueEngine('pistons')}>
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formPower">Power:</label>
                                <input class="o-field__input" min="1" type="number" name="power" id="formPower" ${this.insertValueEngine('power')}>
                            </div>                       
                            <div class="o-field">
                                <label class="o-field__label" for="formTorque">Torque:</label>
                                <input class="o-field__input" type="number" name="torque" min="1" id="formTorque" ${this.insertValueEngine('torque')}>
                            </div>
                        </div>
                    </div>
                </form>
             </div>`;
    }

    private insertValue(property: string): string {
        let value = '';

        if (this.car && this.car[property]) {
            value = this.car[property];
        }

        return value ? 'value="' + value + '"' : '';
    }

    private insertValueEngine(property: string): string {
        let value = '';

        if (this.car && this.car.engine[property]) {
            value = this.car.engine[property];
        }

        return value ? 'value="' + value + '"' : '';
    }

    private fillBrandSelect() {
        const selectHTML = document.querySelector('.js-brand-select') as HTMLSelectElement;
        let selectList = ''

        if (!this.car) {
            selectList += '<option hidden selected>---</option>'
        }

        this.carService.getBrands().then(brands => {
            brands.forEach(brand => selectList += `<option value="${brand}" ${this.car && this.car.brand === brand ? 'selected' : ''}>${brand}</option>`)
            selectHTML.innerHTML = selectList;
            this.refreshSubmit();
        });
    }

    private fillBodySelect() {
        const selectHTML = document.querySelector('.js-body-select') as HTMLSelectElement;
        let selectList = '';

        if (!this.car || (this.car && !this.car.bodyStyle)) {
            selectList += '<option hidden selected>---</option>'
        }

        this.carService.getBodyStyles().then(bodyStyles => {
            bodyStyles.forEach(bodyStyle => {

                selectList += `<option value="${bodyStyle}" ${this.car && this.car.bodyStyle === bodyStyle ? 'selected' : ''}>${bodyStyle}</option>`
            })
            selectHTML.innerHTML = selectList;
            this.refreshSubmit();
        });
    }

    private fillLayoutSelect() {
        const selectHTML = document.querySelector('.js-layout-select') as HTMLSelectElement;
        const layouts = ['R', 'B', 'V', 'W', 'H', 'Other'];
        let selectList = ''

        if (!this.car || (this.car && !this.car.engine.layout)) {
            selectList += '<option hidden selected>---</option>'
        }

        layouts.forEach(layout => selectList += `<option value="${layout}" ${this.car && this.car.engine.layout === layout ? 'selected' : ''}>${layout}</option>`);

        selectHTML.innerHTML = selectList;
        this.refreshSubmit();
    }

    private insertImage() {
        if (!this.car || !this.car.image) {
            return;
        }

        const image = this.menageCarPage.querySelector('.js-image') as HTMLDivElement;
        const imageHTML = `
<img class="o-car-thumb__image js-current-image" src="${this.car.image}" alt="">
<button class="o-car-thumb__delete js-image-delete"><i class="ico Xdelete"></i></button>
`
        image.insertAdjacentHTML('beforeend', imageHTML);
    }

    private eventListeners() {
        const imageDeleteBtn = document.querySelector('.js-image-delete');
        const form = document.querySelector('#menageCar') as HTMLFormElement;

        form.onsubmit = async (ev) => this.handleSubmit(ev);
        if (imageDeleteBtn) {
            imageDeleteBtn.addEventListener('click', () => this.handleImageDelete());
        }
    }

    private handleSubmit(ev: Event) {
        ev.preventDefault();
        const form = ev.currentTarget as HTMLFormElement;
        const data = new FormData(form)

        if (this.car) {
            this.car.editFromForm(data);
            if (this.uploadedImage || this.isImageDelete) {
                this.car.image = this.uploadedImage;
            } else {
                const imageLink = this.car.image ? this.car.image.split('/'): '';;
                this.car.image = imageLink[imageLink.length - 1];
            }

            this.carService.editCar(this.car).then(() => this.routing.goDetails(this.car.id))
        } else {
            const car = Car.createFromForm(data);
            car.image = this.uploadedImage;

            this.carService.addCar(car).then(() => this.routing.goHome())
        }
    }

    private handleImageDelete() {
        this.isImageDelete = true;
        const image = this.menageCarPage.querySelector('.js-current-image') as HTMLDivElement;
        const btn = this.menageCarPage.querySelector('.js-image-delete') as HTMLDivElement;
        const addImageBtn = this.menageCarPage.querySelector('.dz-button') as HTMLDivElement;

        addImageBtn.innerText = '+ Add image';
        image.parentElement.removeChild(image);
        btn.parentElement.removeChild(btn);
    }

    private dropzoneSettings() {
        const ico = `
            <svg viewBox="0 0 32 32" class="o-ico">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M31.4127 0.589608C31.5989 0.775339 31.7466 0.99598 31.8474 1.23889C31.9482 1.48181 32.0001 1.74222 32.0001 2.00521C32.0001 2.26821 31.9482 2.52862 31.8474 2.77153C31.7466 3.01445 31.5989 3.23509 31.4127 3.42082L3.42047 31.413C3.04503 31.7884 2.53582 31.9994 2.00487 31.9994C1.47391 31.9994 0.964703 31.7884 0.589261 31.413C0.21382 31.0376 0.00289917 30.5283 0.00289917 29.9974C0.00289917 29.4664 0.21382 28.9572 0.589261 28.5818L28.5814 0.589608C28.7672 0.403407 28.9878 0.255677 29.2307 0.154879C29.4736 0.0540812 29.7341 0.00219727 29.997 0.00219727C30.26 0.00219727 30.5205 0.0540812 30.7634 0.154879C31.0063 0.255677 31.2269 0.403407 31.4127 0.589608V0.589608Z"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.589211 0.589608C0.403011 0.775339 0.25528 0.99598 0.154482 1.23889C0.0536845 1.48181 0.00180054 1.74222 0.00180054 2.00521C0.00180054 2.26821 0.0536845 2.52862 0.154482 2.77153C0.25528 3.01445 0.403011 3.23509 0.589211 3.42082L28.5814 31.413C28.9568 31.7884 29.466 31.9994 29.997 31.9994C30.528 31.9994 31.0372 31.7884 31.4126 31.413C31.788 31.0376 31.999 30.5283 31.999 29.9974C31.999 29.4664 31.788 28.9572 31.4126 28.5818L3.42042 0.589608C3.23469 0.403407 3.01405 0.255677 2.77114 0.154879C2.52822 0.0540813 2.26781 0.00219727 2.00482 0.00219727C1.74182 0.00219727 1.48141 0.0540813 1.2385 0.154879C0.995583 0.255677 0.774942 0.403407 0.589211 0.589608Z"/>
            </svg>
        `

        Dropzone.options.addImage = {
            paramName: "image",
            thumbnailHeight: 256,
            thumbnailWidth: 400,
            acceptedFiles: 'image/*',
            maxFiles: 1,
            dictDefaultMessage: this.car && this.car.image ? '' : '+ Add image',
            addRemoveLinks: true,
            dictCancelUpload: ico,
            dictRemoveFile: ico,
            headers: {
                'Cache-Control': null,
                'X-Requested-With': null
            }
        }
    }

    private refreshSubmit(add = true) {
        this.submitUnlock += add ? 1 : -1;

        const submitBtn = document.querySelector('.js-submit') as HTMLButtonElement;

        if (this.submitUnlock > 3) {
            submitBtn.removeAttribute("disabled");
        } else {
            submitBtn.setAttribute("disabled", "true");
        }
    }

    private handleUpload() {
        this.dropzoneSettings();
        const myDropzone = new Dropzone("#add-image", {url: "https://service-base-api.es3d.pl/upload-image"});
        myDropzone.on('success', (data, uploadedImage) => {
            this.uploadedImage = uploadedImage;
            this.refreshSubmit();
        });
        myDropzone.on('addedfile', () => this.refreshSubmit(false));
        myDropzone.on('removedfile', () => this.uploadedImage = null);
    }
}