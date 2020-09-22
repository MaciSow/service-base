import '../scss/app.scss';

import '@fortawesome/fontawesome-free/js/all.min';
import {addIcons} from "./utilities";
import {CarService} from "./services/CarService";
import {Routing} from "./services/Routing";

const carService = new CarService()

addIcons();
carService.init().then(() => {
    new Routing(carService);
});




