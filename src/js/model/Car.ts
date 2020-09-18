import {Engine} from "./Engine";
import {Repair} from "./Repair";
import {getEngine} from "../api";

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

    static createFromJSON(json) {
        return new Promise( resolve => {
            const car = new Car();
            car.id = json.id;
            car.image = json.image;
            car.brand = json.brand;
            car.model = json.model;
            car.bodyStyle = json.bodyStyle;
            car.version = json.version;
            car.year = json.year;
            car.overview = new Date();

            getEngine(json.engineId).then(data => {

                const engine = new Engine();
                engine.name = data.name;
                engine.capacity = data.capacity;
                engine.layout = data.layout;
                engine.pistons = data.pistons;
                engine.power = data.power;
                engine.torque = data.torque;

                car.engine = engine;

                resolve(car);
            });
        })
    }
}
