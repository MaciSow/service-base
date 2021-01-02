import {getDateFromString} from "../utilities";
import {Part} from "./Part";
import {v4 as makeId} from 'uuid'

export class Repair {
    id: string;
    title: string;
    date: Date;
    mileage: number;
    notice: string;
    parts: Part[] = [];

    static createFromJSON(json) {
        let repair = new Repair();

        repair.id = json.id;
        repair.title = json.title;
        repair.date = getDateFromString(json.date);
        repair.mileage = json.mileage;
        repair.notice = json.notice;

        repair.parts

        return repair
    }

    static createFromForm(data: FormData): Repair {
        const repair = new Repair();

        repair.id = makeId();
        repair.title = data.get('title').toString();
        repair.date = getDateFromString(data.get('date').toString(), '-', true);
        repair.mileage = +data.get('mileage').toString();
        repair.notice = data.get('notice').toString();
        return repair;
    }

    editFromForm(data: FormData) {
        this.title = data.get('title').toString();
        this.date = getDateFromString(data.get('date').toString(), '-', true);
        this.mileage = +data.get('mileage').toString();
        this.notice = data.get('notice').toString();
    }

    costsSum() {
        const partsTable = [] as Part[];

        let previousConnectionId = '---';

        this.parts.forEach(part => {
            if (!part.connectId) {
                partsTable.push(part);
                return;
            }

            const connectIdItems = part.connectId.split('-');

            if (connectIdItems[0] === 'invoice' && connectIdItems[1] !== 'group') {
                partsTable.push(part);
                return;
            }

            if (part.connectId !== previousConnectionId) {
                partsTable.push(part);
            }

            previousConnectionId = part.connectId;
        });

        return partsTable.reduce((sum, part) => sum + part.price, 0);
    }

    deletePart(partId: string) {
        this.parts = this.parts.filter(item => item.id !== partId);
    }

    addPart(part: Part) {
        this.parts.push(part);
    }

    getPart(partId: string): Part {
        return this.parts.find(part => part.id === partId);
    }
}