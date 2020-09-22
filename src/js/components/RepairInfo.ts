import {Car} from "../model/Car";
import {Routing} from "../services/Routing";
import {CarService} from "../services/CarService";
import {addIcons} from "../utilities";
import {Repair} from "../model/Repair";

export class RepairInfo {
    car: Car;
    repair: Repair;
    private carService: CarService;
    private routing: Routing;
    private repairInfoPage: HTMLDivElement;

    constructor(routing: Routing, carService: CarService, car: Car, repair: Repair) {
        this.carService = carService;
        this.routing = routing;
        this.car = car;
        this.repair = repair;
        this.init();
    }

    private init() {
        this.repairInfoPage = document.querySelector('.js-repair-info');
        this.routing.setBack('/', 'js-repair-info', 'js-car-details');

        if (!this.repairInfoPage) {
            return;
        }

        document.title = `Repair Info - ${this.repair.title}`;
        this.carService.getRepairs(this.car).then(repairs => {
            this.car.repairs = repairs;
            this.fillWindow();
            addIcons();
        });
    }

    private fillWindow() {
        // console.log('repairinfo');
    }
}