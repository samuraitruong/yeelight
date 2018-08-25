import { IConfig } from "./models/config";
import { EventEmitter} from "events";
export class Yeeligt extends EventEmitter{
    constructor(private options: IConfig) {
        super();
        this.emit("test", "hello")
    }
}