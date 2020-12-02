import {addIcons} from "../utilities";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {Car} from "../model/Car";
import * as Dropzone from "dropzone";

export class MenageCar {
    private carService: CarService;
    private routing: Routing;
    private menageCarPage: HTMLDivElement;
    private uploadedImage: string;

    constructor(routing: Routing, carService: CarService) {
        this.carService = carService;
        this.routing = routing;
        this.init();
    }

    private init() {
        this.menageCarPage = document.querySelector('.js-menage-car');
        this.routing.setBack('/', 'js-menage-car', 'js-menu-page');

        if (!this.menageCarPage) {
            return;
        }

        document.title = `Add New Vehicle`;
        this.fillWindow();
        Dropzone.options.addImage = {
            paramName: "image",
            thumbnailHeight: 256,
            thumbnailWidth: 400,
            acceptedFiles: 'image/*',
            maxFiles: 1,
            dictDefaultMessage: '+ Add image',
            addRemoveLinks: true,
            headers: {
                'Cache-Control': null,
                'X-Requested-With': null
            }
        }
        const myDropzone = new Dropzone("#add-image", {url: "https://service-base-api.es3d.pl/upload-image"});

        myDropzone.on('success', (data, uploadedImage) => this.uploadedImage = uploadedImage);

        this.eventListeners();
        addIcons();
    }

    private fillWindow() {
        let carHtml = this.createWindow();
        this.menageCarPage.insertAdjacentHTML("beforeend", carHtml)
        this.fillBrandSelect();
        this.fillBodySelect();
    }

    private createWindow(): string {
        const currentYear = new Date().getFullYear();

        return ` 
            <div class="l-menage-car">          
                <h2 class="o-title-l1--center">Add New Vehicle</h2>
                <form id="menageCar" class="l-menage-car__content">
                    <div>
                        <div id="add-image" class="dropzone content__image ">
                               <i class="ico car"></i>
                        </div>
                        <img class="content__image u-hide" src="" alt="">
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
                                <input class="o-field__input" type="text" name="model" id="formModel" ">
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formBodyStyle">Body Style:</label>
                                <select class="o-field__select js-body-select" name="bodyStyle"  id="formBodyStyle"></select>
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formVersion">Version:</label>
                                <input class="o-field__input" type="text" name="version" id="formVersion">
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formYear">Year:</label>
                                <input class="o-field__input" min="1800" max="${currentYear + 1}" type="number" name="year" id="formYear">
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
                                <input class="o-field__input" name="capacity" pattern="^\\d{1,2}\\.?\\d{1,3}" id="formCapacity" title="Invalid format, must be digit" type="text"> 
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formName">Name:</label>
                                <input class="o-field__input" type="text" name="name" id="formName">
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formLayout">Layout:</label>
                                <select class="o-field__select" name="layout" size="1">
                                <option hidden selected>---</option>
                                <option value="R">R</option>
                                <option value="B">B</option>
                                <option value="V">V</option>
                                <option value="W">W</option>
                                <option value="H">H</option>
                                </select>
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formPistons">Pistons:</label>
                                <input class="o-field__input" min="0" max="32" type="number" name="pistons" id="formPistons">
                            </div>
                            <div class="o-field">
                                <label class="o-field__label" for="formPower">Power:</label>
                                <input class="o-field__input" min="0" type="number" name="power" id="formPower">
                            </div>                       
                            <div class="o-field">
                                <label class="o-field__label" for="formTorque">Torque:</label>
                                <input class="o-field__input"  type="number" name="torque" min="0" id="formTorque">
                            </div>
                        </div>
                    </div>
                </form>
             </div>`;
    }

    private fillBodySelect() {
        const selectHTML = document.querySelector('.js-body-select') as HTMLSelectElement;
        let selectList = '<option hidden selected>---</option>'

        this.carService.getBodyStyles().then(bodyStyles => {
            bodyStyles.forEach(bodyStyle => selectList += `<option value="${bodyStyle}">${bodyStyle}</option>`)
            selectHTML.innerHTML = selectList;
        });
    }

    private fillBrandSelect() {
        const selectHTML = document.querySelector('.js-brand-select') as HTMLSelectElement;
        let selectList = '<option hidden selected>---</option>'

        this.carService.getBrands().then(brands => {
            brands.forEach(brand => selectList += `<option value="${brand}">${brand}</option>`)
            selectHTML.innerHTML = selectList;
        });
    }

    private eventListeners() {
        const submitBtn = document.querySelector('.js-submit');

        submitBtn.addEventListener('click', () => this.handleSubmit());
    }

    private handleSubmit() {
        const form = document.querySelector('#menageCar') as HTMLFormElement;

        form.onsubmit = async (ev) => {
            ev.preventDefault();
            const data = new FormData(form)
            const car = Car.createFromForm(data);
            car.image = this.uploadedImage;

            this.carService.addCar(car).then(() => this.routing.goHome())
        };
    }
}