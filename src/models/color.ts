export class Color {
    constructor(public red: number, public green: number, public blue: number, public color?: string) {

    }
    public getValue() {
        if (this.color) {
            return 1;
        }
        // tslint:disable-next-line:no-bitwise
        return this.red * 65535 + this.green * 256 + this.blue;
    }
}