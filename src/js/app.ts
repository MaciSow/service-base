import '../scss/app.scss';

import '@fortawesome/fontawesome-free/js/all.min';
import {Menu} from "./components/Menu";
import {addIcons, hideWindow, showWindow} from "./utilities";
import {CarDetails} from "./components/CarDetails";
import {CarService} from "./services/CarService";

let carService = new CarService()

const menuPage = document.querySelector('.js-menu-page') as HTMLDivElement;
const carDetailsPage = document.querySelector('.js-car-details') as HTMLDivElement;
const btnBack = document.querySelector('.js-back') as HTMLAnchorElement;


addIcons();
carService.init().then(() => new Menu(carService));


window.onpopstate = function (event) {
    if (event.state && 'car' in event.state) {
        hideWindow().then(() => {
            const car = carService.getCar(event.state.car);
            new CarDetails(car);
            showWindow(carDetailsPage);
        })
    } else {
        hideWindow().then(() => {
            new Menu(carService);
            showWindow(menuPage);
        });
    }
}

btnBack.addEventListener('click', () => history.back());


export function setBack(route: string = null, currentPage: string = null, page: string = null) {
    btnBack.href = route;
    btnBack.dataset.page = page;
    btnBack.dataset.currentPage = currentPage;

    if (route) {
        btnBack.classList.remove("u-hide");
    } else {
        btnBack.classList.add("u-hide");
    }
}


