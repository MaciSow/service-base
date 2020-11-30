import {Car} from "../model/Car";
import {
    createCar,
    createEngine, createPart,
    createRepair,
    deleteCar,
    deletePart,
    deleteRepair,
    getBodyStyles,
    getBrands,
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
                // this.carList.sort(((a, b) => (a.id - b.id)));
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

    getCar(id: string) {
        return this.carList.filter(car => car.id === id)[0]
    }

    getCars() {
        return this.carList;
    }

    addCar(car: Car): Promise<boolean> {
        return new Promise((resolve => {
            createEngine(car.engine).then(() => {
                createCar(car).then(() => {
                    this.carList.push(car);
                    resolve(true);
                });
            });
        }))
    }

    getBodyStyles(): Promise<string[]> {
        return new Promise((resolve => {
            getBodyStyles().then(data => resolve(data.bodyStyles));
        }));
    }

    getBrands(): Promise<string[]> {
        return new Promise((resolve => {
            getBrands().then(data => resolve(data.brands));
        }));
    }

    getCarByRepairId(repairId: string): Car {
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

    getRepair(id: string): Promise<Repair> {
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

                if (!repairsJSON.length) {
                    resolve([]);
                }

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

    addRepair(repair: Repair, car: Car): Promise<boolean> {
        return new Promise((resolve => {
            createRepair(repair, car.id).then(() => {
                car.addRepair(repair);
                resolve(true);
            });
        }))
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

    deleteRepairs(car: Car, repairsId: string[]) {
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

                if (!partsJSON.length) {
                    resolve([]);
                }

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

    addPart(part: Part, repair: Repair): Promise<boolean> {
        return new Promise((resolve => {
            createPart(part, repair.id).then(() => {
                repair.addPart(part);
                resolve(true);
            });
        }))
    }

    deletePart(repair: Repair, partId: string): Promise<boolean> {
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

    deleteParts(repair: Repair, partsId: string[]): Promise<boolean> {
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

    private cropItems(source: any[], items: string[]): any[] {
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