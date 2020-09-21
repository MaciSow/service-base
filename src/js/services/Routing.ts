import {hideWindow, showWindow} from "../utilities";
import {CarDetails} from "../components/CarDetails";
import {Menu} from "../components/Menu";
import {CarService} from "./CarService";

export class Routing {
    private readonly carService: CarService;

    menuPage = document.querySelector('.js-menu-page') as HTMLDivElement;
    carDetailsPage = document.querySelector('.js-car-details') as HTMLDivElement;
    btnBack = document.querySelector('.js-back') as HTMLAnchorElement;

    constructor(carService: CarService) {
        this.carService = carService;
        this.init();
    }

    init() {
        const queryString = window.location.search;
        if (queryString) {
            const car = this.carService.getCar(+(queryString.split('=')[1]));
            new CarDetails(car, this);
            showWindow(this.carDetailsPage);
        } else {
            new Menu(this.carService, this)
            showWindow(this.menuPage)
        }


        window.onpopstate = (event) => {
            if (event.state && 'car' in event.state) {
                hideWindow().then(() => {
                    const car = this.carService.getCar(event.state.car);
                    new CarDetails(car, this);
                    showWindow(this.carDetailsPage);
                })
            } else {
                hideWindow().then(() => {
                    new Menu(this.carService, this);
                    showWindow(this.menuPage);
                });
            }
        }

        this.btnBack.addEventListener('click', () => this.goBack());
    }

    setBack(route: string = null, currentPage: string = null, page: string = null) {
        this.btnBack.href = route;
        this.btnBack.dataset.page = page;
        this.btnBack.dataset.currentPage = currentPage;

        if (route) {
            this.btnBack.classList.remove("u-hide");
        } else {
            this.btnBack.classList.add("u-hide");
        }
    }

    goBack() {
        const queryString = window.location.search;
        if (queryString) {
            hideWindow().then(() => {
                new Menu(this.carService, this);
                showWindow(this.menuPage);
            });
        history.pushState({}, "Home", `/`)
        }
            // history.back()
    }
}

