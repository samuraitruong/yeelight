import { EventEmitter } from "events";
import { Socket, SocketConnectOpts } from "net";
import { Discover } from "./discover";
import { defaultLogger } from "./logger";
import {
    AdjustType, Color, Command, CommandType, DevicePropery,
    FlowState, ICommandResult, IConfig, IDevice, IEventResult, Scene, StartFlowAction,
} from "./models";
import { ILogger } from "./models/logger";

const DEFAULT_PORT = 55443;
/**
 * The client to connect and control the light
 */
export class Yeelight extends EventEmitter {
    public connected: boolean;
    public autoReconnect = false;
    public disablePing = false;
    public autoReconnectTime = 1000;
    public connectTimeout = 1000;

    private client: Socket;
    private commandId = 1;
    private sentCommands: { [commandId: string]: Command } = {};
    private resultCommands: ICommandResult[];

    private isConnecting = false;
    private isClosing = false;
    private isReconnecting = false;
    private reconnectTimeout: NodeJS.Timer | null = null;
    private pingTimeout: NodeJS.Timer | null = null;

    private readonly EVENT_NAME = "command_result";
    /**
     * @constructor
     * @param {IConfig} options : The client config initial the client
     */
    constructor(private options: IConfig, private logger?: ILogger) {
        super();
        this.logger = logger || defaultLogger;
        this.resultCommands = new Array<ICommandResult>();
        this.emit("ready", this);
        // Set default timeout if not provide
        this.options.timeout = this.options.timeout || 5000;
    }
    public onData(data: Buffer) {
        const messages = data.toString();

        messages.split("\n").forEach((message) => {
            const json = message.toString();
            if (json) {
                const result: ICommandResult = JSON.parse(json);
                this.onMessage(result);
            }
        });
    }
    public onMessage(result: ICommandResult) {
        this.resultCommands.push(result);
        const commandId = "" + result.id;
        const originalCommand = this.sentCommands[commandId];
        if (!originalCommand) {
            if (result.method === 'props') {
                this.emit('props', result.params);
            }
            return;
        }
        const eventData: IEventResult = {
            action: originalCommand.method,
            command: originalCommand,
            result,
            success: true,
        };
        this.logger.info("Light data recieved: ", result);
        this.emit(`${this.EVENT_NAME}_${result.id}`, eventData);
        this.emit(originalCommand.method, eventData);

        delete this.sentCommands[commandId];

        if (result.id && result.result) {
            this.emit("commandSuccess", eventData);
        }
        if (result && result.error) {
            eventData.success = false;
            this.emit("commandError", eventData);
        }
    }
    /**
     * Drop connection/listerners and clean up resources.
     */
    public disconnect(): Promise<void> {
        this.removeAllListeners();
        this.emit("end");
        // this.client.destroy();
        this.client.removeAllListeners("data");
        this.isClosing = true;
        return new Promise((resolve) => this.client.end(resolve as any))
            .then(() => {
                return this.closeConnection();
            });
    }
    /**
     * establish connection to light,
     * @returns return promise of the current instance
     */
    public async connect(): Promise<Yeelight> {
        if (this.isConnecting) {
            throw new Error("Already connecting");
        }

        if (this.options.lightIp) {
            return this.connectToIp(this.options.lightIp, this.options.lightPort);
        } else if (this.options.lightId) {
            // If only the Id is given, start searching for that id:
            const discover = new Discover({
                filter: (d: IDevice) => d.id === this.options.lightId,
                limit: 1,
                timeout: this.connectTimeout,
            });
            const devices = await discover.start();
            await discover.destroy();
            const device = devices[0];
            if (device) {
                return this.connectToIp(device.host, device.port);
            } else {
                throw new Error("Unable to connect, no device with id '" + this.options.lightId + "' found");
            }
        } else {
            throw new Error("Unable to connect, neither config.lightIp or options.lightId is set");
        }
    }
    /*
     * This method is used to switch on or off the smart LED (software managed on/off)
     * @param turnOn:boolean set status true is turn on, false is turn off
     * @param {"smooth"| "sudden"} effect  support two values: "sudden" and "smooth". If effect is "sudden",
     * then the color temperature will be changed directly to target value,
     * under this case, the third parameter "duration" is ignored. If effect is "smooth",
     * then the color temperature will be changed to target value in a gradual fashion, under this case,
     * the total time of gradual change is specified in third parameter "duration".
     * @param {number} duration  specifies the total time of the gradual changing. The unit is milliseconds.
     * The minimum support duration is 30 milliseconds.
     * @returns {Promise<IEventResult>} return a promise of IEventResult
    */
    public setPower(
        turnOn = true,
        effect: "smooth" | "sudden" = "sudden",
        duration = 500,
    ): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_POWER, [(turnOn ? "on" : "off"), effect, duration]));
    }
    /**
     * This method is used to start a timer job on the smart LED.
     * Only accepted if the smart LED is currently in "on" state
     * @param type currently can only be 0. (means power off)
     * @param time the length of the timer (in minutes). Request
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public cronAdd(type: number, time: number): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.CRON_ADD, [0, time]));
    }
    /**
     * This method is used to retrieve the setting of the current cron job of the specified type.
     * @param type currently can only be 0. (means power off)
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public cronGet(type: number): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.CRON_GET, [type]));
    }
    /**
     * This method is used to retrieve the setting of the current cron job of the specified type.
     * @param type currently can only be 0. (means power off)
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public cronDelete(type: number): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.CRON_DEL, [type]));
    }
    /**
     * This method is used to toggle the smart LED.
     * This method is used to switch on or off the smart LED (software managed on/off)
     * @returns {Promise<ICommandResult>} Return the promise indicate the command success or reject
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public toggle(): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.TOGGLE, []));
    }
    /**
     *  This method is used to save current state of smart LED in persistent memory.
     *  So if user powers off and then powers on the smart LED again (hard power reset),
     *  the smart LED will show last saved state.
     * For example, if user likes the current color (red) and brightness (50%)
     * and want to make this state as a default initial state (every time the smart LED is powered),
     * then he can use set_default to do a snapshot.
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setDefault(): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_DEFAULT, []));
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
     * @param {number} repeat is the total number of visible state changing before color flow
     *  stopped. 0 means infinite loop on the state changing. @default infinity
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public startColorFlow(states: FlowState[], action: StartFlowAction = StartFlowAction.LED_STAY,
        repeat = 0): Promise<IEventResult> {
        const values = states.reduce((a, b) => [...a, ...b.getState()], []);
        return this.sendCommand(new Command(1, CommandType.START_COLOR_FLOW,
            [repeat, action, values.join(",")]));
    }
    /**
     * This method is used to stop a running color flow.
     */
    public stopColorFlow(): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.STOP_COLOR_FLOW, []));
    }
    /**
     * This method is used to set the smart LED directly to specified state.
     * If the smart LED is off, then it will turn on the smart LED firstly and then apply the specified command
     * @param scene type of scene to update
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setScene<T extends Scene>(scene: T): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_SCENE, scene.getData()));
    }
    /**
     * This method is used to retrieve current property of smart LED.
     * @param {string[]} params  The parameter is a list of property names and the response contains a
     * list of corresponding property values.
     * the requested property name is not recognized by smart LED, then a empty string value ("") will be returned.
     * Request Example:     {"id":1,"method":"get_prop","params":["power", "not_exist", "bright"]}
     * Example:  {"id":1, "result":["on", "", "100"]}
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public getProperty(params: DevicePropery[]): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.GET_PROPS, params));
    }
    /**
     *  This method is used to change the color temperature of a smart LED.
     * @param {number} ct the target color temperature. The type is integer and range is 1700 ~ 6500 (k).
     * @param {"smooth"| "sudden"} effect  support two values: "sudden" and "smooth". If effect is "sudden",
     * then the color temperature will be changed directly to target value,
     * under this case, the third parameter "duration" is ignored. If effect is "smooth",
     * then the color temperature will be changed to target value in a gradual fashion, under this case,
     * the total time of gradual change is specified in third parameter "duration".
     * @param {number} duration  specifies the total time of the gradual changing. The unit is milliseconds.
     * The minimum support duration is 30 milliseconds.
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setCtAbx(
        ct: number,
        effect: "smooth" | "sudden" = "sudden",
        duration = 500,
    ): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_CT_ABX, [ct, effect, duration]));
    }
    /**
     * This method is used to change the color of a smart LED.
     * Only accepted if the smart LED is currently in "on" state.
     * @param color  the target color, whose type is integer.
     * It should be expressed in decimal integer ranges from 0 to 16777215 (hex: 0xFFFFFF).
     * can be initial by new Color(233,255,244)
     * @param {"smooth"| "sudden"} effect  support two values: "sudden" and "smooth". If effect is "sudden",
     * then the color temperature will be changed directly to target value,
     * under this case, the third parameter "duration" is ignored. If effect is "smooth",
     * then the color temperature will be changed to target value in a gradual fashion, under this case,
     * the total time of gradual change is specified in third parameter "duration".
     * @param {number} duration  specifies the total time of the gradual changing. The unit is milliseconds.
     * The minimum support duration is 30 milliseconds.
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setRGB(color: Color, effect: "smooth" | "sudden", duration = 500): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_RGB, [color.getValue(), effect, duration]));
    }
    /**
     * This method is used to change the color of a smart LED.
     * Only accepted if the smart LED is currently in "on" state.
     * @param hue  the target hue, whose type is integer.
     * It should be expressed in decimal integer ranges from 0 to 359.
     * @param sat  the target saturation, whose type is integer.
     * It should be expressed in decimal integer ranges from 0 to 100.
     * @param {"smooth"| "sudden"} effect  support two values: "sudden" and "smooth". If effect is "sudden",
     * then the color temperature will be changed directly to target value,
     * under this case, the third parameter "duration" is ignored. If effect is "smooth",
     * then the color temperature will be changed to target value in a gradual fashion, under this case,
     * the total time of gradual change is specified in third parameter "duration".
     * @param {number} duration  specifies the total time of the gradual changing. The unit is milliseconds.
     * The minimum support duration is 30 milliseconds.
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setHSV(
        hue: number,
        sat: number,
        effect: "smooth" | "sudden" = "sudden",
        duration = 500,
    ): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_HSV, [hue, sat, effect, duration]));
    }
    /**
     * This method is used to change the color of a smart LED.
     * Only accepted if the smart LED is currently in "on" state.
     * @param brightness  is the target brightness. The type is integer and ranges from 1 to 100.
     * The brightness is a percentage instead of a absolute value.
     * 100 means maximum brightness while 1 means the minimum brightness.
     * @param {"smooth"| "sudden"} effect  support two values: "sudden" and "smooth". If effect is "sudden",
     * then the color temperature will be changed directly to target value,
     * under this case, the third parameter "duration" is ignored. If effect is "smooth",
     * then the color temperature will be changed to target value in a gradual fashion, under this case,
     * the total time of gradual change is specified in third parameter "duration".
     * @param {number} duration  specifies the total time of the gradual changing. The unit is milliseconds.
     * The minimum support duration is 30 milliseconds.
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setBright(
        brightness: number,
        effect: "smooth" | "sudden" = "sudden",
        duration = 500,
    ): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_BRIGHT, [brightness, effect, duration]));
    }
    /**
     * @param command This method is used to change brightness, CT or color of a smart LED without
     * knowing the current value, it's main used by controllers.
     * @param {AdjustType} adjustType the direction of the adjustment. The valid value can be:
     * increase: increase the specified property
     * decrease: decrease the specified property
     * circle: increase the specified property, after it reaches the max value back to minimum value
     * @param {string} prop  the property to adjust. The valid value can be:
     * “bright": adjust brightness.
     * “ct": adjust color temperature.
     * “color": adjust color.
     * (When “prop" is “color", the “action" can only be “circle", otherwise, it will be deemed as invalid request.)
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setAdjust(adjustType: AdjustType, prop: "bright" | "color" | "ct"): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_ADJUST, [adjustType, prop]));
    }
    /**
     * This method is used to start or stop music mode on a device.
     * Under music mode, no property will be reported and no message quota is checked.
     * @param action the action of set_music command. The valid value can be:
     * 0: turn off music mode.
     * 1: turn on music mode.
     * @param {string} host the IP address of the music server.
     * @param {number} port  the TCP port music application is listening on.
     * When control device wants to start music mode, it needs start a TCP server firstly and then call “set_music”
     * command to let the device know the IP and Port of the TCP listen socket. After received the command,
     * LED device will try to connect the specified peer address. If the TCP connection can be established successfully,
     * then control device could send all supported commands through this channel without limit to simulate any music
     * effect. The control device can stop music mode by explicitly send a stop command or just by closing the socket.
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setMusic(action: 0 | 1, host: string, port: number): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_MUSIC, [action, host, port]));
    }

    /**
     * This method is used to name the device.
     * The name will be stored on the device and reported in discovering response.
     * User can also read the name through “get_prop” method
     * @param {string} name  the name of the device.
     * When using Yeelight official App, the device name is stored on cloud.
     * This method instead store the name on persistent memory of the device, so the two names could be different.
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public setName(name: string): Promise<IEventResult> {
        return this.sendCommand(new Command(1, CommandType.SET_NAME, [name]));
    }
    /**
     * This method is used to adjust the brightness by specified percentage within specified duration.
     * @param {number} percentage the percentage to be adjusted. The range is: -100 ~ 100
     * @param {number} duration the milisecond of animation
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public adjust(type: CommandType.ADJUST_BRIGHT | CommandType.ADJUST_COLOR | CommandType.ADJUST_CT,
        percentage = 0, duration = 500): Promise<IEventResult> {
        return this.sendCommand(new Command(1, type, [percentage, duration]));
    }
    /**
     * This method is used to just check if the connection is alive
     */
    public ping(): Promise<null> {
        return this.sendCommand(new Command(1, CommandType.PING, []))
            .catch((command: IEventResult) => {
                // Expect a response: {"id":6, "error":{"code":-1, "message":"method not supported"}}
                const result = command.result;
                if (
                    !result ||
                    !result.error ||
                    result.error.code !== -1 ||
                    !(result.error.message + "").match(/not supported/i)
                ) {
                    throw command;
                }
            })
            .then(() => {
                // do nothing with the response
                return null;
            });
    }
    /**
     * Use this function to send any command to the light,
     * please refer to specification to know the structure of command data
     * @param {Command} command The command to send to light via socket write
     * @returns {Promise<IEventResult>} return a promise of IEventResult
     */
    public sendCommand(command: Command): Promise<IEventResult> {
        if (!this.connected) {
            return Promise.reject("Connection is closed");
        }
        return new Promise((resolve, reject) => {
            const commandId = this.commandId++;
            command.id = commandId;
            this.sentCommands["" + commandId] = command;

            const timer = setTimeout(() => {
                this.removeAllListeners(`${this.EVENT_NAME}_${command.id}`);
                this.emit("commandTimedout", command);
                this.wasDisconnected();
                reject("Command timedout, no response from server.");
            }, this.options.timeout);

            this.once(`${this.EVENT_NAME}_${command.id}`, (commandResult: IEventResult) => {
                clearTimeout(timer);

                const result = commandResult.result;
                if (result.id && result.result) {
                    resolve(commandResult);
                } else if (result.error) {
                    reject(commandResult);
                }
            });
            const msg = command.getString();
            this.client.write(msg + "\r\n", () => {
                this.emit(command.method + "_sent", command);
            });
        });
    }
    private connectToIp(host: string, port: number): Promise<Yeelight> {
        return new Promise((resolve, reject) => {
            this.isConnecting = true;
            this.isClosing = false;
            if (this.client) {
                // close old socket:
                this.closeConnection();
            }
            this.client = new Socket();
            this.client.on("data", this.onData.bind(this));
            this.client.on("connect", () => {
                this.wasConnected();
            });
            this.client.on("close", () => {
                this.wasDisconnected();
            });
            this.client.on("end", () => {
                this.wasDisconnected();
            });
            this.client.on("error", (err) => {
                this.emit("error", err);
                this.wasDisconnected();
            });

            this.client.connect(port || DEFAULT_PORT, host, () => {
                this.isConnecting = false;
                this.wasConnected();
                // me.emit("connected", this);
                resolve(this);
            });
            this.client.once("error", (err) => {
                this.isConnecting = false;
                reject(err);
            });
            setTimeout(() => {
                this.isConnecting = false;
                reject("Connection timeout");
            }, this.connectTimeout);
        });
    }
    private wasConnected() {
        this.isReconnecting = false;
        if (!this.connected) {
            this.connected = true;
            this.emit("connected");
            this.triggerPing();
        }
    }
    private wasDisconnected() {
        if (this.connected) {
            this.connected = false;
            this.emit("disconnected");
        }

        this._recoverNetworkError();
    }
    private _recoverNetworkError() {
        if (this.autoReconnect && !this.isClosing) {
            this.isReconnecting = true;

            if (!this.reconnectTimeout) {
                this.reconnectTimeout = setTimeout(() => {
                    this.reconnectTimeout = null;
                    if (!this.connected) {
                        if (!this.isConnecting) {
                            this.connect()
                                .catch((err) => {
                                    if (!err.toString().match(/timeout/)) { // ignore connection timeout
                                        this.emit("error", "Erorr during reconnect: " + err);
                                    }
                                    this._recoverNetworkError();
                                });
                        } else {
                            this._recoverNetworkError();
                        }
                    }
                }, this.autoReconnectTime);
            }
        }
    }
    private triggerPing() {
        if (this.connected && !this.disablePing) {
            this.ping()
                .then(() => {
                    if (!this.pingTimeout) {
                        this.pingTimeout = setTimeout(() => {
                            this.pingTimeout = null;
                            this.triggerPing();
                        }, this.connectTimeout);
                    }
                })
                .catch(() => {
                    // swallow
                });
        }
    }
    private closeConnection() {
        this.wasDisconnected();
        if (this.client) {
            this.client.removeAllListeners();
            this.client.destroy();
        }
    }

}
