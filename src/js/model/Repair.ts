import {getDateFromString} from "../utilities";
import {Part} from "./Part";

export class Repair {
    id: number;
    title: string;
    date: Date;
    mileage: number;
    notice: string;
    parts: Part[] = [];
    partsId: number[] = [];

    static createFromJSON(json) {
        let repair = new Repair();

        repair.id = +json.id;
        repair.title = json.title;
        repair.date = getDateFromString(json.date);
        repair.mileage = json.mileage;
        repair.notice = json.notice;
        repair.partsId = json.partsId;

        return repair
    }

    costsSum() {
        return this.parts.reduce((sum, part) => sum + part.price, 0);
    }

}