import {Repair} from "./model/Repair";
import {getStringDate} from "./utilities";
import {Car} from "./model/Car";

const serverUrl = 'https://service-base-api.es3d.pl';

function fetchJson(url: string, options = null) {
    let headers = {'Content-Type': 'application/json'};
    if (options && options.headers) {
        headers = {...headers, ...options.headers};
        delete options.headers;
    }

    return fetch(url, Object.assign({
        headers
    }, options))
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
    console.log(response.statusText);

    throw error;
}

export function getCars() {
    const url = `${serverUrl}/cars`;
    return fetchJson(url);
}

export function getCar(id: number) {
    const url = `${serverUrl}/cars/${id}`;
    return fetchJson(url);
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

export function deleteCar(id: number) {
    const url = `${serverUrl}/cars/${id}`;

    return fetchJson(url, {
        method: 'DELETE'
    });
}

export function getRepair(id: number) {
    const url = `${serverUrl}/repairs/${id}`;
    return fetchJson(url);
}

export function getCarRepairs(id: number) {
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

export function deleteRepair(id: number) {
    const url = `${serverUrl}/repairs/${id}`;

    return fetchJson(url, {
        method: 'DELETE'
    });
}

export function getPart(id: number) {
    const url = `${serverUrl}/parts/${id}`;
    return fetchJson(url);
}

export function getRepairParts(id: number) {
    const url = `${serverUrl}/repairs/${id}/parts`;
    return fetchJson(url);
}

export function deletePart(id: number) {
    const url = `${serverUrl}/parts/${id}`;

    return fetchJson(url, {
        method: 'DELETE'
    });
}
