import {Car} from "../model/Car";
import {deletePart, deleteRepair, getCars, getPart, getRepair, updateCar, updateRepair} from "../api";
import {Repair} from "../model/Repair";
import {Part} from "../model/Part";

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

    getRepair(id: number): Promise<Repair> {
        return new Promise((resolve) => {

            getRepair(id).then((repairJSON) => {
                const repair = Repair.createFromJSON(repairJSON);

                resolve(repair);
            })
        })
    }

    getParts(repair: Repair): Promise<Part[]> {
        return new Promise((resolve) => {
            const parts: Part[] = [];
            let counter = 0;

            repair.partsId.forEach(partId => {
                getPart(partId).then((partJSON) => {
                    const part = Part.createFromJSON(partJSON)

                    parts.push(part);
                    counter++;

                    if (counter === repair.partsId.length) {
                        resolve(parts);
                    }
                })
            })

        })
    }

    deletePart(repair: Repair, partId: number): Promise<boolean> {
        return new Promise((resolve) => {

            repair.partsId = repair.partsId.filter(id => id !== partId);
            repair.parts = repair.parts.filter(part => part.id !== partId);

            updateRepair(repair).then(
                () => deletePart(partId).then(
                    () => resolve(true),
                    () => resolve(false)
                ),
                () => resolve(false));
        });
    }

    deleteRepair(repair: Repair) {
        return new Promise((resolve) => {
            const {id} = repair;
            const car = this.carList.find(car => {
                const repairId = car.repairsId.find(repairId => repairId === id)
                return repairId !== undefined;
            })
            let counter = 0;
            const parts = repair.parts;
            car.deleteRepair(repair);

            updateCar(car).then(() =>
                deleteRepair(repair.id).then(() =>
                    parts.forEach((part) =>
                        deletePart(part.id).then(
                            () => {
                                if (counter === repair.parts.length - 1) {
                                    resolve(true);
                                }
                                counter++;
                            }
                        )
                    )
                )
            );
        })
    }
}