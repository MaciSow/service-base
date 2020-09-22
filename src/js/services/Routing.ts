import {hideWindow, showWindow} from "../utilities";
import {CarDetails} from "../components/CarDetails";
import {Home} from "../components/Home";
import {CarService} from "./CarService";
import {RepairInfo} from "../components/RepairInfo";

export class Routing {
    private readonly carService: CarService;

    homePage = document.querySelector('.js-menu-page') as HTMLDivElement;
    carDetailsPage = document.querySelector('.js-car-details') as HTMLDivElement;
    repairInfoPage = document.querySelector('.js-repair-info');
    btnBack = document.querySelector('.js-back') as HTMLAnchorElement;

    constructor(carService: CarService) {
        this.carService = carService;
        this.init();
    }

    init() {
        const queryString = window.location.search;

        this.goSiteByLink(queryString);
        this.goSiteByHistory();
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
        const queryString = window.location.search.split('&');
        queryString.pop();
        const url = queryString.join('&');

        hideWindow().then(() => {
            this.goSiteByLink(url);
            history.pushState({}, "", `/${url}`)
        });
    }

    goHome() {
        hideWindow().then(() => {
            new Home(this.carService, this);
            showWindow(this.homePage);
        });
    }

    goDetails(carId: number, addHistory: boolean = true) {
        if (addHistory) {
            history.pushState({car: carId}, "Car Details", `?car=${carId}`)
        }

        hideWindow().then(() => {
            const car = this.carService.getCar(carId);
            new CarDetails(car, this, this.carService)
            showWindow(this.carDetailsPage);
        });
    }

    goRepairInfo(carId: number, repairId: number, addHistory: boolean = true) {
        if (addHistory) {
            history.pushState({car: carId, repair: repairId}, "Repair Info", `?car=${carId}&repair=${repairId}`)
        }

        hideWindow().then(() => {
            const car = this.carService.getCar(carId);
            const repair = car.getRepair(repairId);
            new RepairInfo(this, this.carService, car, repair)
            showWindow(this.repairInfoPage);
        });
    }

    private goSiteByLink(queryString: string, addHistory: boolean = true) {
        if (!queryString) {
            this.goHome();
            return;
        }

        const parameters = queryString.substring(1).split('&');
        const items = [];
        let match: boolean = false;

        parameters.forEach(parameter => {
            items.push(parameter.split('='))
        })

        switch (parameters.length) {
            case 1:
                if (items[0][0] === 'car') {
                    this.goDetails(+items[0][1], addHistory);
                    match = true;
                }
                break;
            case 2:
                if (items[0][0] === 'car' && items[1][0] === 'repair') {
                    this.goRepairInfo(+items[0][1], +items[1][1], addHistory);
                    match = true;
                }
                break;
            default:
                break;
        }

        if (!match) {
            this.goHome();
        }
    }

    private goSiteByHistory() {
        window.onpopstate = (event) => {
            if (!event.state) {
                this.goHome();
                return;
            }

            let queryString = '?';

            for (const value in event.state) {
                queryString += value + '=' + event.state[value] + '&';
            }

            queryString = queryString.slice(0, -1);
            this.goSiteByLink(queryString, false);
        }
    }

}

