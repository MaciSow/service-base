import {getDateFromString} from "../utilities";

export class Insurance {
    id: string;
    company: string;
    expireDate: Date = new Date();
    cost: number;
    ac: boolean = false;
    oc: boolean = false;
    nnw: boolean = false;

    fillFromJSON(json) {
        const {id, company, expireDate, cost, ac, oc, nnw} = json;

        this.id = id;
        this.company = company;
        this.expireDate = getDateFromString(expireDate);
        this.cost = cost;
        this.ac = ac;
        this.oc = oc;
        this.nnw = nnw;
    }

    fillFromForm(data) {
        this.company = 'Warta';
        this.expireDate = new Date();
        this.cost = 350;
        this.ac = true;
        this.oc = true;
        this.nnw = false;
    }
}