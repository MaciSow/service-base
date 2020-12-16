import {getPositiveNumberOrNull} from "../utilities";

export class Engine {
    id: number;
    capacity: number;
    name: string;
    layout: string;
    pistons: number;
    power: number;
    torque: number;

    toString() {
        let {layout = '', pistons = '', capacity = ''} = this;

        if (layout && pistons && capacity) {
            return `${layout}${pistons} ${capacity}L`;
        }

        if (layout && pistons) {
            return `${layout}${pistons}`;
        }
        if (capacity) {
            return `${capacity}L`;
        }

        return  '';
    }

    fillFromJSON(json) {
        const {id, name, capacity, layout, pistons, power, torque} = json;

        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.layout = layout;
        this.pistons = pistons;
        this.power = power;
        this.torque = torque;
    }

    fillFromForm(data) {
        const layout = data.get('layout').toString();

        this.name = data.get('name').toString();
        this.capacity = getPositiveNumberOrNull(data, 'capacity');
        this.layout = layout === '---' ? '' : layout;
        this.pistons = getPositiveNumberOrNull(data, 'pistons');
        this.power = getPositiveNumberOrNull(data, 'power');
        this.torque = getPositiveNumberOrNull(data, 'torque');
    }
}