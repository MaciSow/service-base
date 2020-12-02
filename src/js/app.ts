import '../scss/app.scss';

import '@fortawesome/fontawesome-free/js/all.min';
import {addIcons, getStringDate} from "./utilities";
import {CarService} from "./services/CarService";
import {Routing} from "./services/Routing";
import  "dropzone";





const carService = new CarService()

Date.prototype.toJSON = function() {
    return getStringDate(this);
}

addIcons();
carService.init().then(() => {
    new Routing(carService);
});




