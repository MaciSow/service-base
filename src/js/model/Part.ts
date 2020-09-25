export class Part {
    id: number;
    name: string;
    model: string;
    price: number;
    invoice: string;
    notice: string;

    static createFromJSON(json): Part {
        let part = new Part();

        part.id = +json.id;
        part.name = json.name;
        part.model = json.model;
        part.price = json.price;
        part.invoice = json.invoice;
        part.notice = json.notice;

        return part
    }
}