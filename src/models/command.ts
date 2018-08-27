import { CommandType } from "./enums";
export class Command {
    public constructor(public id: number, public method: CommandType, public params: any[]) {

    }
    public getString() {
        return JSON.stringify(this);
    }
}