import { EventEmitter } from "events";
import { Socket, SocketConnectOpts } from "net";
import { Command } from "./models/command";
import { IConfig } from "./models/config";
import { CommandType, StartFlowAction } from "./models/enums";
import { FlowState } from "./models/flow-state";
export class Yeeligt extends EventEmitter {
    private client: Socket;
    private connected: boolean;
    private sentCommands: Command[];
    constructor(private options: IConfig) {
        super();
        this.sentCommands = new Array<Command>();
        this.client = new Socket();
        this.client.on("data", (b: Buffer) => console.log(b.toString()));
        this.emit("ready", "ready");
    }
    public connect() {
        const me = this;
        this.client.connect(this.options.lightPort, this.options.lightIp, () => {
            this.connected = true;
            me.emit("connected", this);
        });
    }
    /*
        This method is used to switch on or off the smart LED (software managed on/off)
        @param turnOn:boolean set status true is turn on, false is turn off
    */
    public setPower(turnOn: boolean = true, effect: string = "smooth", duration: number = 500) {
        this.sendCommand(new Command(1, CommandType.SET_POWER, [(turnOn ? "on" : "off"), effect, duration]));
    }
    /**
     * This method is used to toggle the smart LED.
     * This method is used to switch on or off the smart LED (software managed on/off)
     */
    public toggle() {
        this.sendCommand(new Command(1, CommandType.TOGGLE, []));
    }
    /**
     *  This method is used to save current state of smart LED in persistent memory.
     *  So if user powers off and then powers on the smart LED again (hard power reset),
     *  the smart LED will show last saved state. 
     */
    public setDefault() {
        this.sendCommand(new Command(1, CommandType.SET_DEFAULT, []));
    }
    /**
     *  This method is used to start a color flow. Color flow is a series of smart LED visible state changing.
     * It can be brightness changing, color changing or color temperature changing. This is the most powerful command.
     * All our recommended scenes,
     * e.g. Sunrise/Sunset effect is implemented using this method.
     * With the flow expression, user can actually “program” the light effect.
     * @param {FlowState[]} states: Each visible state changing is defined to be a flow tuple that contains 4 elements:
     * [duration, mode, value, brightness]. A flow expression is a series of flow tuples.
     * So for above request example, it means: change CT to 2700K & maximum brightness gradually in 1000ms,
     * then change color to red & 10% brightness gradually in 500ms, then stay at this state for 5 seconds,
     * then change CT to 5000K & minimum brightness gradually in 500ms.
     * After 4 changes reached, stopped the flow and power off the smart LED.
     * @param {StarFlowAction} action:  is the action taken after the flow is stopped
     * 0 means infinite loop on the state changing.
     */
    public startColorFlow(states: FlowState[], action: StartFlowAction = StartFlowAction.LED_STAY) {
        const values = states.reduce((a, b) => [...a, ...b.getState()], []);
        this.sendCommand(new Command(1, CommandType.START_COLOR_FLOW, [states.length, action, values.join(",")]));
    }
    public sendCommand(command: Command) {
        const me = this;
        command.id = (this.sentCommands.length + 1);
        this.sentCommands.push(command);
        this.client.write(command.getString() + "\r\n", () => {
            me.emit(command.method);
        })
    }

}