import {Car} from "../model/Car";
import {getCars} from "../api";

export class CarService {

    private carList: Car[] = [];

    constructor() {

    }

    getCars() {
        return this.carList;
    }

    init(): Promise<null> {
        return new Promise(resolve => {
            this.makeCarsList().then(() => {
                this.carList.sort(((a, b) => (a.id - b.id)));
                resolve();
            });
        })
    }

    makeCarsList() {
        return new Promise((resolve) => {
            getCars().then((carsData: Car[]) => {
                let counter = 0;
                carsData.forEach((carData) => {

                    Car.createFromJSON(carData).then((car: Car) => {
                        this.carList.push(car)
                        counter++;

                        if (counter === carsData.length) {
                            resolve();
                        }
                    })
                })
            })
        })
    }

    getCar(id: number): Car {
        return this.carList.filter(car => car.id === id)[0]
    }
}