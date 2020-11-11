import {Engine} from "./Engine";
import {Repair} from "./Repair";

export class Car {
    id: number;
    image: string;
    brand: string;
    model: string;
    bodyStyle: 'hetchback' | 'sedan' | 'coupe' | 'cabrio' | 'combi' | 'suv';
    version: string;
    year: number;
    engine: Engine;

    insurance: {
        date: Date;
    }
    overview: Date = new Date();

    repairs: Repair[] = [];

    fullName(): string {
        return `${this.brand} ${this.model}`
    }

    static createFromJSON(json) : Car{
            const car = new Car();
            car.id = +json.id;
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

    getRepair(repairId: number): Repair {
        return this.repairs.find(repair => repair.id === repairId)
    }

    deleteRepair(repair: Repair) {
        this.repairs = this.repairs.filter(item => item !== repair);
    }
}
