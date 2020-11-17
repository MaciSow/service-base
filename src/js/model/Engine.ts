export class Engine {
    id: number;
    capacity: number;
    name: string;
    layout: string;
    pistons: number;
    power: number;
    torque: number;

    toString(){
        return`${this.layout}${this.pistons} ${this.capacity}L`;
    }
}