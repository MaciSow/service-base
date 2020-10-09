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

            repair.partsId = this.cropItems(repair.partsId, partsId);
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

    deleteRepair(repair: Repair) {
        return new Promise((resolve) => {
            const {id} = repair;
            const car = this.getCarByRepairId(id);
            const parts = repair.parts;
            car.deleteRepair(repair);

            parts.forEach((part, index) =>
                deletePart(part.id).then(
                    () => {
                        if (index === repair.parts.length - 1) {
                            deleteRepair(repair.id).then(
                                () => updateCar(car).then(
                                    () => resolve(true)
                                )
                            );
                        }
                    }
                )
            )
        })
    }

    getCarByRepairId(repairId: number): Car {
        return this.carList.find(car => {
            const repairId = car.repairsId.find(id => id === repairId)
            return repairId !== undefined;
        })
    }

    deleteRepairs(car: Car, repairsId: number[]) {
        return new Promise((resolve) => {
            
            let partsId = [];
            
            repairsId.forEach( id => {
                const repair = car.repairs.find( item => item.id === id);
                partsId = [...partsId, ...repair.partsId ];
            })

            partsId.forEach( partId => {
                deletePart(partId).then(
                    () => console.log(`%c ✔ delete part ${partId}`, 'color: green'),
                    () => console.log(`%c ❗ error delete part ${partId}`, 'color: red')
                );
            })

            console.log(partsId);

            
            
            
            // const repairsCopy = car.repairs.filter(repair => repairsId.find(id=> id===repair.id));
            // console.log(repairsCopy===car.repairs);
            // console.log(repairsCopy);
            //
            // car.repairsId = this.cropItems(car.repairsId, repairsId);
            // car.repairs = this.cropItems(car.repairs, repairsId);
            //
            //
            // repairsCopy.forEach((repair, indexRepairs) => {
            //     repair.partsId.forEach((part, index) =>
            //         deletePart(part).then(
            //             () => {
            //                 if (index === repair.partsId.length - 1) {
            //                     deleteRepair(repair.id).then(() => {
            //                             if (indexRepairs === repairsCopy.length-1) {
            //                                 updateCar(car).then(
            //                                     () => resolve(true)
            //                                 )
            //                             }
            //                         }
            //                     );
            //                 }
            //             },
            //             () => console.log('ooops 🙄')
            //         )
            //     )
            // })

        })
    }
}