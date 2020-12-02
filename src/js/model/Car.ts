import {Engine} from "./Engine";
import {Repair} from "./Repair";
import {v4 as makeId} from 'uuid'
import {getDateFromString} from "../utilities";
import {Insurance} from "./Insurance";

export class Car {
    id: string;
    image: string;
    brand: string;
    model: string;
    bodyStyle: string;
    version: string;
    year: number;
    engine: Engine;

    insurance: Insurance
    overview: Date = new Date();

    repairs: Repair[] = [];

    fullName(): string {
        return `${this.brand} ${this.model}`
    }

    static createFromJSON(json): Car {
        const car = new Car();
        car.id = json.id;
        car.image = json.image;
        car.brand = json.brand;
        car.model = json.model;
        car.bodyStyle = json.bodyStyle;
        car.version = json.version;
        car.year = json.year;
        car.overview = new Date();

        const engine = new Engine();
        engine.name = json.engine.name;
        engine.capacity = json.engine.capacity;
        engine.layout = json.engine.layout;
        engine.pistons = json.engine.pistons;
        engine.power = json.engine.power;
        engine.torque = json.engine.torque;

        car.engine = engine;

        return car;
    }

    static createFromForm(data: FormData): Car {
        const car = new Car();

        car.id = makeId();
        car.image = null;
        car.brand = data.get('brand').toString();
        car.model = data.get('model').toString();
        car.bodyStyle = data.get('bodyStyle').toString();
        car.version = data.get('version').toString();
        car.year = +data.get('year');
        car.overview = getDateFromString(data.get('overview').toString(), '-', true);
        car.insurance = new Insurance(getDateFromString(data.get('insurance').toString(), '-', true));

        const engine = new Engine();
        engine.id = makeId();
        engine.name = data.get('name').toString();
        engine.capacity = +(data.get('capacity').toString());
        engine.layout = data.get('layout').toString();
        engine.pistons = +data.get('pistons');
        engine.power = +data.get('power');
        engine.torque = +data.get('torque');

        car.engine = engine;

        return car;
    }

    addRepair(repair:Repair){
        this.repairs.push(repair);
    }

    getRepair(repairId: string): Repair {
        return this.repairs.find(repair => repair.id === repairId)
    }

    deleteRepair(repair: Repair) {
        this.repairs = this.repairs.filter(item => item !== repair);
    }
}
