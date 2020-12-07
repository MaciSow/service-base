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
    if (response.status >= 200 && response.status < 400) {
        return response;
    }

    const error = new Error(response.statusText);
    error.message = response.message;
    console.log(response);

    throw error;
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
    const url = `${serverUrl}/cars/body-styles`;
    return fetchJson(url);
}

export function getBrands() {
    const url = `${serverUrl}/cars/brands`;
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
    const carCopy = {...car};
    
    delete carCopy.overview;
    delete carCopy.insurance;
    delete carCopy.repairs;

    const url = `${serverUrl}/cars`;
    return fetchJson(url, {
        method: 'POST',
        body: JSON.stringify(carCopy)
    });
}

export function updateCar(car: Car) {
    const carCopy = {...car, engineId: car.engine.id, overview: getStringDate(car.overview)};
    delete carCopy.engine;
    delete carCopy.repairs;
    delete carCopy.insurance;

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

export function updateRepair(repair: Repair) {
    const repairCopy = {...repair, date: getStringDate(repair.date)};
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