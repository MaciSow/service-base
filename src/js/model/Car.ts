import {Engine} from "./Engine";
import {Repair} from "./Repair";
import {v4 as makeId} from 'uuid'
import {getDateFromString, getPositiveNumberOrNull} from "../utilities";
import {Insurance} from "./Insurance";

export class Car {
    id: string;
    image: string;
    brand: string;
    model: string;
    bodyStyle: string;
    version: string;
    year: number;
    overview: Date = new Date();
    engine: Engine = new Engine();
    insurance: Insurance = new Insurance();
    repairs: Repair[] = [];

    fullName(): string {
        return `${this.brand} ${this.model}`
    }

    static createFromJSON(json): Car {
        const car = new Car();
        const {id, image, brand, model, bodyStyle, version, year, engine, insurance} = json;

        car.id = id;
        car.image = image;
        car.brand = brand;
        car.model = model;
        car.bodyStyle = bodyStyle;
        car.version = version;
        car.year = year;
        car.overview = new Date();

        car.engine.fillFromJSON(engine);
        car.insurance.fillFromJSON(insurance);

        return car;
    }

    static createFromForm(data: FormData): Car {
        const car = new Car();

        let tmp = data.get('bodyStyle').toString();

        car.id = makeId();
        car.image = null;
        car.brand = data.get('brand').toString();
        car.model = data.get('model').toString();
        car.bodyStyle = tmp === '---' ? '' : tmp;
        car.version = data.get('version').toString();
        car.year = getPositiveNumberOrNull(data, 'year');
        car.overview = getDateFromString(data.get('overview').toString(), '-', true);

        car.engine.id = makeId();
        car.engine.fillFromForm(data);

        car.insurance.id = makeId();
        car.insurance.fillFromForm(data);

        return car;
    }

    editFromForm(data: FormData) {
        this.brand = data.get('brand').toString();
        this.model = data.get('model').toString();
        this.bodyStyle = data.get('bodyStyle').toString();
        this.version = data.get('version').toString();
        this.year = getPositiveNumberOrNull(data, 'year');
        this.overview = getDateFromString(data.get('overview').toString(), '-', true);

        this.engine.fillFromForm(data);
        this.insurance.fillFromForm(data);
    }

    addRepair(repair: Repair) {
        this.repairs.push(repair);
    }

    getRepair(repairId: string): Repair {
        return this.repairs.find(repair => repair.id === repairId)
    }

    deleteRepair(repair: Repair) {
        this.repairs = this.repairs.filter(item => item !== repair);
    }
}
