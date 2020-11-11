import {Car} from "../model/Car";
import {
    deleteCar,
    deletePart,
    deleteRepair,
    getCarRepairs,
    getCars,
    getRepair,
    getRepairParts,
    updateCar,
    updateRepair
} from "../api";
import {Repair} from "../model/Repair";
import {Part} from "../model/Part";

export class CarService {
    private carList: Car[] = [];

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
            getCars().then((data) => {

                let counter = 0;
                const cars: string[] = data.cars;
                cars.forEach((carData) => {
                    const car = Car.createFromJSON(carData);

                    this.carList.push(car)
                    counter++;

                    if (counter === cars.length) {
                        resolve();
                    }
                })
            })
        })
    }

    getCar(id: number) {
        return this.carList.filter(car => car.id === id)[0]
    }

    getCars() {
        return this.carList;
    }

    getCarByRepairId(repairId: number): Car {
        return this.carList.find(car => {
            const chooseRepair = car.repairs.find(repair => repair.id === repairId)
            return chooseRepair !== undefined;
        })
    }

    deleteCar(car: Car): Promise<boolean> {
        return new Promise((resolve => {
            deleteCar(car.id).then(() => {
                this.carList = this.carList.filter((item) => item !== car);
                resolve(true);
            });
        }));

    }

    getRepair(id: number): Promise<Repair> {
        return new Promise((resolve) => {

            getRepair(id).then((repairJSON) => {
                const repair = Repair.createFromJSON(repairJSON);

                resolve(repair);
            })
        })
    }

    getRepairs(car: Car): Promise<Repair[]> {

        return new Promise((resolve) => {
            if (car.repairs.length) {
                resolve(car.repairs);
            }

            let counter = 0;
            let repairs: Repair[] = [];

            getCarRepairs(car.id).then((data) => {
                const repairsJSON: string[] = data.repairs;

                repairsJSON.forEach(repairJSON => {
                    const repair = Repair.createFromJSON(repairJSON);

                    repairs.push(repair);
                    counter++;

                    if (counter === repairsJSON.length) {
                        resolve(repairs);
                    }
                })
            })
        });
    }

    deleteRepair(repair: Repair) {
        return new Promise((resolve) => {
            const {id} = repair;
            const car = this.getCarByRepairId(id);


            car.deleteRepair(repair);

            deleteRepair(id).then(
                () => updateCar(car).then(
                    () => resolve(true)
                )
            );
        })
    }

    deleteRepairs(car: Car, repairsId: number[]) {
        return new Promise((resolve) => {
            let counter = 1;
            car.repairs = this.cropItems(car.repairs, repairsId);

            repairsId.forEach(id => {
                deleteRepair(id).then(() => {
                    if (counter) {
                        updateCar(car).then(() => resolve(true));
                    }
                    counter++;
                });
            })
        })
    }

    getParts(repair: Repair): Promise<Part[]> {
        return new Promise((resolve) => {
            const parts: Part[] = [];
            let counter = 0;

            getRepairParts(repair.id).then((data) => {
                const partsJSON: string[] = data.parts;

                partsJSON.forEach(partJSON => {
                    const part = Part.createFromJSON(partJSON);

                    parts.push(part);
                    counter++;

                    if (counter === partsJSON.length) {
                        resolve(parts);
                    }
                })
            })

        })
    }

    deletePart(repair: Repair, partId: number): Promise<boolean> {
        return new Promise((resolve) => {
            repair.deletePart(partId)

            deletePart(partId).then(
                () => updateRepair(repair).then(
                    () => resolve(true),
                    () => resolve(false)
                ),
                () => resolve(false));
        });
    }

    deleteParts(repair: Repair, partsId: number[]): Promise<boolean> {
        return new Promise((resolve) => {

            repair.parts = this.cropItems(repair.parts, partsId);

            partsId.forEach((partId, index) => {
                deletePart(partId).then(
                    () => {
                        if (index + 1 === partsId.length) {
                            updateRepair(repair).then(
                                () => resolve(true),
                                () => resolve(false)
                            )
                        }
                    },
                    () => resolve(false)
                );
            })
        });
    }

    private cropItems(source: any[], items: number[]): any[] {
        return source.filter(item => {
                const id = typeof item === 'object' ? item.id : item;
                let isExist = true;

                items.forEach(partId => {
                    if (partId === id) {
                        isExist = false;
                    }
                })
                return isExist;
            }
        );
    }
}