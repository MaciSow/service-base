import {Car} from "../model/Car";
import {getCars, getRepair} from "../api";
import {Repair} from "../model/Repair";

export class CarService {
    private carList: Car[] = [];

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

    getRepairs(car: Car): Promise<Repair[]> {

        return new Promise((resolve) => {
            if (car.repairs.length) {
                resolve(car.repairs);
            }

            let counter = 0;
            let repairs: Repair[] = [];

            car.repairsId.forEach(repairId => {

                getRepair(repairId).then((repairJSON) => {
                    const repair = Repair.createFromJSON(repairJSON);

                    repairs.push(repair);
                    counter++;

                    if (counter === car.repairsId.length) {
                        resolve(repairs);
                    }
                });
            });
        });
    }
}