import {v4 as makeId} from 'uuid'
import {Part} from "./Part";

export class ConnectPart {
    id: string;
    invoiceShare: boolean;
    priceShare: boolean;
    groupId: number;

    constructor(id: string, priceShare: boolean = false, groupId: number = null) {
        this.id = id;
        this.invoiceShare = true;
        this.priceShare = priceShare;
        this.groupId = groupId;
    }

    toString(): string {
        let connectString = '';

        connectString += this.invoiceShare ? 'invoice-' : '';

        if (this.priceShare) {
            connectString += 'price-';
        } else {
            connectString += this.groupId ? `group-${this.groupId}-` : '';
        }

        connectString += `#${this.id}`;

        return connectString;
    }

    static createFromString(connectId: string): ConnectPart {
        if (!connectId) {
            return null
        }

        const id = connectId.split('#')[1];

        const connectPart = new ConnectPart(id);

        if (connectId.match('.{8}(price){1}.*')) {
            connectPart.priceShare = true;
        }
        if (connectId.match('.{8}(group){1}-\\d{1,3}-.*')) {
            connectPart.groupId = +connectId.split('-')[2];
        }

        return connectPart;
    }

    static sort(partList: Part[]) {
        partList.sort((a, b) => {
            if (!a.connect || !b.connect) {
                return -1;
            }

            const tmpA = a.connect.id + '-' + a.connect.groupId ?? '';
            const tmpB = b.connect.id + '-' + b.connect.groupId ?? '';

            return tmpA.localeCompare(tmpB)
        });
    }


    static getNextGroupId(partList: Part[], id: string): number {
        let parts = partList.filter(part => {
            if (!part.connect) {
                return false
            }

            return part.connect.id === id;
        });

        parts = parts.filter(part => part.connect.groupId !== null);

        if (0 === parts.length) {
            return 1;
        }

        const groups = parts.map(item => item.connect.groupId);
        return Math.max(...groups) + 1;

        // return parts.reduce((a, b) => +b.connect.groupId >= a ? a = b.connect.groupId +1 : a, 1);
    }

    static generateId(): string {
        return makeId()
    }
}