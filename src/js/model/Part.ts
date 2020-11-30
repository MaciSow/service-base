import {v4 as makeId} from 'uuid'

export class Part {
    id: string;
    name: string;
    model: string;
    price: number;
    invoice: string;
    notice: string;

    static createFromJSON(json): Part {
        let part = new Part();

        part.id = json.id;
        part.name = json.name;
        part.model = json.model;
        part.price = json.price;
        part.invoice = json.invoice;
        part.notice = json.notice;

        return part
    }

    static createFromForm(data: FormData):Part {
        let part = new Part();

        part.id = makeId();
        part.name = data.get('part').toString();
        part.model = data.get('model').toString();
        part.price = +data.get('price').toString();
        // part.invoice = data.get('invoice').toString();
        part.notice = data.get('notice').toString();

        return part
    }
}