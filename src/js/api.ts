function fetchJson(url: string, options = null) {
    let headers = {'Content-Type': 'application/json'};
    if (options && options.headers) {
        headers = {...headers, ...options.headers,};
        delete options.headers;
    }

    return fetch(url, Object.assign({
        // credentials: 'same-origin'
        headers
    }, options))
        .then(checkStatus)
        .then(response => {
            // console.log(response);

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
    const url = 'http://localhost:3000/cars';
    return fetchJson(url);
}

export function getCar(id: number) {
    const url = `http://localhost:3000/cars/${id}`;
    return fetchJson(url);
}

export function getEngine(id: number) {
    const url = `http://localhost:3000/engines/${id}`;
    return fetchJson(url);
}

export function getRepair(id: number) {
    const url = `http://localhost:3000/repairs/${id}`;
    return fetchJson(url);
}

export function getPart(id:number) {
    const url = `http://localhost:3000/parts/${id}`;
    return fetchJson(url);
}