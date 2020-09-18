export class Engine {
    id: number;
    capacity: number;
    name: string;
    layout: 'R/I'| 'V'| 'B'| 'W';
    pistons: number;
    power: number;
    torque: number;

    toString(){
        return`${this.layout}${this.pistons} ${this.capacity}L`;
    }


}