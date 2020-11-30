import {clearListeners, hideWindow, showWindow} from "../utilities";
import {CarDetails} from "../components/CarDetails";
import {Home} from "../components/Home";
import {CarService} from "./CarService";
import {RepairInfo} from "../components/RepairInfo";
import {MenageCar} from "../components/MenageCar";
import {MenageRepair} from "../components/MenageRepair";
import {MenagePart} from "../components/MenagePart";

export class Routing {
    private readonly carService: CarService;

    homePage = document.querySelector('.js-menu-page') as HTMLDivElement;
    menageCarPage = document.querySelector('.js-menage-car') as HTMLDivElement;
    carDetailsPage = document.querySelector('.js-car-details') as HTMLDivElement;
    repairInfoPage = document.querySelector('.js-repair-info');
    btnBack = document.querySelector('.js-back') as HTMLAnchorElement;
    btnAdd = document.querySelector('.js-add') as HTMLAnchorElement;
    btnSubmit = document.querySelector('.js-submit') as HTMLButtonElement;
    repairInfo:RepairInfo = null;

    constructor(carService: CarService) {
        this.carService = carService;
        this.init();
    }

    init() {
        const queryString = window.location.search;

        this.goSiteByLink(queryString);
        this.goSiteByHistory();
        this.btnAdd.addEventListener('click', () => this.goAdd());
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

    private goAdd() {
        const pages = document.querySelectorAll('.js-pages > div') as NodeListOf<HTMLDivElement>;

        pages.forEach((page)=> {
          if (!page.classList.contains('u-hide')){
              if (page.classList.contains('js-menu-page')){
                  this.goMenageCar();
              }

              if (page.classList.contains('js-car-details')){
                  this.openMenageRepair();
              }

              if (page.classList.contains('js-repair-info')){
                  this.openMenagePart();
              }
          }
        })
    }

    goBack() {
        const queryString = window.location.search.split('&');
        queryString.pop();
        const url = queryString.join('&');

        hideWindow().then(() => {
            this.resetPage();

            this.goSiteByLink(url);
            history.pushState({}, "", `/${url}`)
        });
    }

    goHome() {
        hideWindow().then(() => {
            this.resetPage();
            history.pushState(null, "", `/`)
            new Home(this.carService, this);
            showWindow(this.homePage);
        });
    }

    goMenageCar() {
        history.pushState(null, "Add New Vehicle", `?create`)

        hideWindow().then(() => {
            this.btnAdd.classList.add('u-hide');
            this.btnSubmit.classList.remove('u-hide');

            this.btnSubmit.setAttribute('form','menageCar');

            new MenageCar(this, this.carService);
            showWindow(this.menageCarPage);
        });
    }

    openMenageRepair() {
        new MenageRepair(this.btnAdd.dataset.id, this, this.carService);
    }

    openMenagePart() {
        new MenagePart(this.btnAdd.dataset.id, this, this.carService,this.repairInfo);
    }

    goDetails(carId: string, addHistory: boolean = true) {
        if (addHistory) {
            history.pushState({car: carId}, "Car Details", `?car=${carId}`)
        }

        hideWindow().then(() => {
            this.btnAdd.dataset.id = carId;
            const car = this.carService.getCar(carId);
            new CarDetails(car, this, this.carService)
            showWindow(this.carDetailsPage);
        });
    }

    goRepairInfo(carId: string, repairId: string, addHistory: boolean = true) {
        if (addHistory) {
            history.pushState({car: carId, repair: repairId}, "Repair Info", `?car=${carId}&repair=${repairId}`)
        }

        hideWindow().then(() => {
            this.btnAdd.dataset.id = repairId;
            const car = this.carService.getCar(carId);
            const repair = car.getRepair(repairId);
            this.repairInfo = new RepairInfo(this, this.carService, car, repair)
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
                    this.goDetails(items[0][1], addHistory);
                    match = true;
                }
                if (items[0][0] === 'create') {
                    this.goMenageCar();
                    match = true;
                }
                break;
            case 2:
                if (items[0][0] === 'car' && items[1][0] === 'repair') {
                    this.goRepairInfo(items[0][1], items[1][1], addHistory);
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
                // noinspection JSUnfilteredForInLoop
                queryString += value + '=' + event.state[value] + '&';
            }

            queryString = queryString.slice(0, -1);
            this.goSiteByLink(queryString, false);
        }
    }

    private resetPage() {
        this.btnSubmit = clearListeners(this.btnSubmit);
        this.btnSubmit.classList.add('u-hide');
        this.btnAdd.classList.remove('u-hide');
        this.btnSubmit.removeAttribute('form');
        this.btnAdd.removeAttribute('data-id');
    }
}

