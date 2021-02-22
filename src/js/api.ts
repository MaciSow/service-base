import {Repair} from "./model/Repair";
import {getStringDate} from "./utilities";
import {Car} from "./model/Car";
import {Engine} from "./model/Engine";
import {Part} from "./model/Part";

const serverUrl = 'https://service-base-api.es3d.pl';

function fetchJson(url: string, options = null) {
    let headers = {'Content-Type': 'application/json'};
    if (options && options.headers) {
        headers = {...headers, ...options.headers};
        delete options.headers;
    }

    return fetch(url, Object.assign({headers}, options))
        .then(checkStatus)
        .then(response => {
            return response.text()
                .then(text => {

                    if (headers['Content-Type'] === 'application/json') {
                        return text ? JSON.parse(text) : '';
                    }
                    return text;
                });
        });
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 500) {
        return response;
    }

    const error = new Error(response.statusText);
    error.message = response.message;

    throw error;
}

function checkError(text) {
    if (+text.status >= 200 && +text.status < 400) {
        return;
    }

    console.log(text.title);

    throw new Error('stop');
}

export function createEngine(engine: Engine) {
    const url = `${serverUrl}/engines`;

    return fetchJson(url, {
        method: 'POST',
        body: JSON.stringify(engine)
    });
}

export function updateEngine(engine: Engine) {
    const engineCopy = {...engine};

    const url = `${serverUrl}/engines/${engine.id}`;
    return fetchJson(url, {
        method: 'PUT',
        body: JSON.stringify(engineCopy)
    });
}

export function getBodyStyles() {
    const url = `${serverUrl}/body-styles`;
    return fetchJson(url);
}

export function getBrands() {
    const url = `${serverUrl}/brands`;
    return fetchJson(url);
}

export function getCars() {
    const url = `${serverUrl}/cars`;
    return fetchJson(url);
}

export function getCar(id: string) {
    const url = `${serverUrl}/cars/${id}`;
    return fetchJson(url);
}

export function createCar(car: Car) {
    const insuranceJSON = {
        ...car.insurance,
        expireDate: getStringDate(car.insurance.expireDate)
    }

    const carCopy = {
        ...car,
        insurance: insuranceJSON,
        overview: getStringDate(car.overview)
    };

    delete carCopy.repairs;

    const url = `${serverUrl}/cars`;

    return fetchJson(url, {
        method: 'POST',
        body: JSON.stringify(carCopy)
    });
}

export function updateCar(car: Car) {
    const insuranceJSON = {
        ...car.insurance,
        expireDate: getStringDate(car.insurance.expireDate)
    }

    const carCopy = {
        ...car,
        overview: getStringDate(car.overview),
        insurance: insuranceJSON
    };
    delete carCopy.repairs;

    const url = `${serverUrl}/cars/${car.id}`;
    return fetchJson(url, {
        method: 'PUT',
        body: JSON.stringify(carCopy)
    });
}

export function deleteCar(id: string) {
    const url = `${serverUrl}/cars/${id}`;

    return fetchJson(url, {
        method: 'DELETE'
    });
}

export function getRepair(id: string) {
    const url = `${serverUrl}/repairs/${id}`;
    return fetchJson(url);
}

export function createRepair(repair: Repair, carId: string) {
    const url = `${serverUrl}/repairs`;
    return fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({...repair, carId})
    });
}

export function getCarRepairs(id: string) {
    const url = `${serverUrl}/cars/${id}/repairs`;
    return fetchJson(url);
}

export function updateRepair(repair: Repair, carId: string = '') {
    let repairCopy;

    if (carId) {
        repairCopy = {...repair, date: getStringDate(repair.date), carId}
    } else {
        repairCopy = {...repair, date: getStringDate(repair.date)}
    }
    delete repairCopy.parts;

    const url = `${serverUrl}/repairs/${repair.id}`;
    return fetchJson(url, {
        method: 'PUT',
        body: JSON.stringify(repairCopy)
    });
}

export function deleteRepair(id: string) {
    const url = `${serverUrl}/repairs/${id}`;

    return fetchJson(url, {
        method: 'DELETE'
    });
}

export function getPart(id: string) {
    const url = `${serverUrl}/parts/${id}`;
    return fetchJson(url);
}

export function createPart(part: Part, repairId: string) {
    const url = `${serverUrl}/parts`;
    return fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({...part, repairId})
    });
}

export function updatePart(part: Part, repairId: string) {
    const url = `${serverUrl}/parts/${part.id}`;
    const invoiceLink = part.invoice ? part.invoice.split('/') : '';
    const invoice = invoiceLink[invoiceLink.length - 1];
    const connectId = part.connect ? part.connect.toString() : '';

    const partCopy = {...part, repairId, invoice, connectId}
    delete partCopy.connect

    return fetchJson(url, {
        method: 'PUT',
        body: JSON.stringify(partCopy)
    });
}

export function getRepairParts(id: string) {
    const url = `${serverUrl}/repairs/${id}/parts`;
    return fetchJson(url);
}

export function deletePart(id: string) {
    const url = `${serverUrl}/parts/${id}`;

    return fetchJson(url, {
        method: 'DELETE'
    });
}

export function fileExist(url: string) {
    // fetch(url, { "": "include"})
    //     .then(response => {
    //         console.log(response);
    //
    //         if (response.status >= 200 && response.status < 400) {
    //             console.log('OK');
    //         }
    //         console.log('error');
    //     });
}