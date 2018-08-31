import { Utils } from "../utils";

export class Color {
    constructor(public red: number, public green: number, public blue: number, public color?: string) {
        if (color) {
            this.color = color.toUpperCase();
            this.red = Utils.hexToNumber(color.substr(0, 2));
            this.green = Utils.hexToNumber(color.substr(2, 2));
            this.blue = Utils.hexToNumber(color.substr(4, 2));
        }
    }
    public getValue() {
        // tslint:disable-next-line:no-bitwise
        return this.red * 65535 + this.green * 256 + this.blue;
    }
}