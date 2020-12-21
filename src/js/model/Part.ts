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
        const {id, name, model, price, invoice, notice} = json;
        part.id = id;
        part.name = name;
        part.model = model;
        part.price = price;
        part.invoice = invoice;
        part.notice = notice;

        return part
    }

    static createFromForm(data: FormData): Part {
        let part = new Part();

        part.id = makeId();
        part.invoice = '';
        part.name = data.get('part').toString();
        part.model = data.get('model').toString();
        part.price = +data.get('price').toString();
        part.notice = data.get('notice').toString();

        return part
    }

    editFromForm(data: FormData) {
        this.name = data.get('part').toString();
        this.model = data.get('model').toString();
        this.price = +data.get('price').toString();
        this.notice = data.get('notice').toString();
    }
}