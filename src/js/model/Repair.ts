import {RepairItem} from "./RepairItem";

export interface Repair {
    title: string;
    date: Date;
    mileage: number;
    notice: string;
    items:RepairItem[]
}