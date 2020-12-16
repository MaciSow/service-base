import {Car} from "../model/Car";
import {
    createCar,
    createPart,
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
import {checkServerErrorStatus} from "../utilities";

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
                const cars: string[] = data;
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
        return this.carList.filter(car => car.id === id)[0];
    }

    getCars() {
        return this.carList;
    }

    addCar(car: Car): Promise<boolean> {
        return new Promise((resolve => {
            createCar(car).then((data) => {
                checkServerErrorStatus(data);

                car.image = data.image ? data.image : '';
                this.carList.push(car);
                resolve(true);
            });
        }))
    }

    editCar(car: Car): Promise<boolean> {
        return new Promise((resolve => {
            updateCar(car).then((data) => {
                checkServerErrorStatus(data);

                car.image = data.image ? data.image : '';
                resolve(true);
            });
        }))
    }

    getBodyStyles(): Promise<string[]> {
        return new Promise((resolve => {
            getBodyStyles().then(data => resolve(data));
        }));
    }

    getBrands(): Promise<string[]> {
        return new Promise((resolve => {
            getBrands().then(data => resolve(data));
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
                const repairsJSON: string[] = data;

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

    editRepair(repair: Repair, car: Car, selectedCar: Car): Promise<boolean> {
        return new Promise((resolve => {
            updateRepair(repair, selectedCar.id).then(() => {

                if (car != selectedCar) {
                    this.getRepairs(selectedCar).then(() => {
                        selectedCar.addRepair(repair);
                        car.deleteRepair(repair);

                        resolve(true)
                    })
                }

                resolve(true)
            });
        }))
    }

    deleteRepair(repair: Repair): Promise<boolean> {
        return new Promise((resolve) => {
            const {id} = repair;
            const car = this.getCarByRepairId(id);
            car.deleteRepair(repair);

            deleteRepair(id).then(
                () => resolve(true),
                () => resolve(false)
            );
        })
    }

    deleteRepairs(car: Car, repairsId: string[]): Promise<boolean> {
        return new Promise((resolve) => {
            car.repairs = this.cropItems(car.repairs, repairsId);

            repairsId.forEach(id => {
                deleteRepair(id).then(
                    () => resolve(true),
                    () => resolve(false)
                );
            })
        })
    }

    getParts(repair: Repair): Promise<Part[]> {
        return new Promise((resolve) => {
            const parts: Part[] = [];
            let counter = 0;

            getRepairParts(repair.id).then((data) => {
                const partsJSON: string[] = data;

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
                () => resolve(true),
                () => resolve(false)
            );
        });
    }

    deleteParts(repair: Repair, partsId: string[]): Promise<boolean> {
        return new Promise((resolve) => {

            repair.parts = this.cropItems(repair.parts, partsId);

            partsId.forEach((partId, index) => {
                deletePart(partId).then(
                    () => resolve(true),
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