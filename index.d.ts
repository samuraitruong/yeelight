/// <reference types="node" />
declare module "yeelight-awesome" {
    export interface ICommandResult {
        id: number;
        success: boolean;
        results: any[];
        result: any[];
        error?: {
            code: number,
            message: string
        };
    }
    export class Command {
        public constructor(id: number, method: CommandType, params: any[]);
        public getString(): string;
    }
    export interface IEventResult {
        action: CommandType;
        command: Command;
        result: ICommandResult;
        success: boolean;
    }

    export enum DeviceStatus {
        ON = "on",
        OFF = "off"
    }
    export enum ColorMode {
        WHITE = 1,
        COLOR = 2,
        FLOW = 3
    }
    /**
 * Each visible state changing is defined to be a flow tuple that contains 4 elements:
 * [duration, mode, value, brightness].
 * A flow expression is a series of flow tuples.  So for above request example,
 * it means: change CT to 2700K & maximum brightness gradually in 1000ms,
 * then change color to red & 10% brightness gradually in 500ms, then stay at this state for 5 seconds,
 * then change CT to 5000K & minimum brightness gradually in 500ms. After 4 changes reached, stopped the
 * flow and power off the smart LED.
 */
    export class FlowState {
        /**
         * @constructor
         * @param duration : Gradual change time or sleep time, in milliseconds, minimum value 50
         * @param mode : 1 – color, 2 – color temperature, 7 – sleep.
         * @param value :  RGB value when mode is 1, CT value when mode is 2, Ignored when mode is 7.
         * @param brightness  Brightness value, -1 or 1 ~ 100. Ignored when mode is 7. When this value is -1,
         * brightness in this tuple is ignored (only color or CT change takes effect).
         */
        constructor(duration: number, mode: number, value: number, brightness: number);
        /**
         * return the array of [duration, mode, value, brightness]
         */
        public getState(): any[];

    }

    /** Command type*/
    export enum CommandType {
        SET_POWER = "set_power",
        TOGGLE = "toggle",
        SET_DEFAULT = "set_default",
        START_COLOR_FLOW = "start_cf",
        STOP_COLOR_FLOW = "stop_cf",
        GET_PROPS = "get_prop",
        SET_SCENE = "set_scene",
        SET_CT_ABX = "set_ct_abx",
        SET_RGB = "set_rgb",
        SET_HSV = "set_hsv",
        SET_BRIGHT = "set_bright",
        CRON_ADD = "cron_add",
        CRON_GET = "cron_get",
        CRON_DEL = "cron_del",
        SET_ADJUST = "set_adjust",
        SET_MUSIC = "set_music",
        SET_NAME = "set_name",
        ADJUST_BRIGHT = "adjust_bright",
        ADJUST_CT = "adjust_ct",
        ADJUST_COLOR = "adjust_color"
    }
    /**
     * the action taken after the flow is stopped.
     */
    export enum StartFlowAction {
        /** smart LED recover to the state before the color flow started. */
        LED_RECOVER = 0,
        /** 1 means smart LED stay at the state when the flow is stopped */
        LED_STAY = 1,
        /** turn off the smart LED after the flow is stopped. */
        LED_OFF = 2
    }
    /**
     * The supported properties
     */
    export enum DevicePropery {
        POWER = "power",
        BRIGHT = "bright",
        CT = "ct",
        RGB = "rgb",
        HUE = "hue",
        SAT = "sat",
        COLOR_MODE = "color_mode",
        FLOWING = "flowing",
        DELAYOFF = "delayoff",
        FLOW_PARAMS = "flow_params",
        MUSIC_ON = "music_on",
        NAME = "name",
        BG_POWER = "bg_power",
        BG_FLOWING = "bg_flowing",
        BG_FLOW_PARAMS = "bg_flow_params",
        BG_CT = "bg_ct",
        BG_LMODE = "bg_lmode",
        BG_BRIGHT = "bg_bright",
        BG_HUE = "bg_hue",
        BG_SAT = "bg_sat",
        BG_RGB = "bg_rgb",
        NL_BR = "nl_br",
        ACTIVE_MODE = "active_mode"
    }

    /**
     * Scene type
     */
    export enum SceneType {
        /** change the smart LED to specified color and brightness. */
        COLOR = "color",
        HSV = "hsv",
        CT = "ct",
        CF = "cf",
        AUTO_DELAY_OFF = "auto_delay_off"
    }
    /**
     * Adjust type
     */
    export enum AdjustType {
        INCREASE = "increase",
        DECREASE = "decrease",
        CIRCLE = "circle"
    }

    /** Yeelight device information */
    export interface IDevice {
        id: string;
        name: string;
        location: string;
        host: string;
        port: number;
        model: string;
        version: string;
        capabilities: string[];
        status: DeviceStatus;
        bright: number;
        mode: ColorMode;
        rgb: number;
        ct: number;
        hue: number;
        sat: number;
    }

    export interface IDiscoverConfig {
        /**The local port number that listening for the message, default is 1982.
         * This port value should not change as the default of manufacture value
         * @default 1982
         */
        port?: number;
        /** The hostname of ip address of machine that code running, default: 127.0.0.1 */
        host?: string;
        /** The multicast IP address to discover device using SSDP.
         * @default : 239.255.255.250
         */
        multicastHost?: string;
        /**
         * Toggle debug mode, that will print our debug information on the console screen
         * @default true
         */
        debug?: boolean;
        /**
         * Set the limit of number devices you want to discover.
         * when discover found x device, if x> limit, the promise will resolve with list of device found
         * @default 1
         */
        limit?: number;
        /**
         * Set the timeout (in miliseconds) for searching,
         * if timeout reach but limit has reach . he promise will fullfil and return
         * @default 10000
         */
        timeout?: number;
        /**
         * The filter function to matching found device
         * This should be an function accept IDevice and return boolean value
         * @default : null
         */
        filter?: (device: IDevice) => boolean;

        /**
         * If after timeout reached and not found any device, fallback to use IP scaner
         * @default true
         */
        fallback?: boolean;
    }
    export class Scene {
        constructor(type: SceneType);
        public getData(): any[];
    }

    export class Color {
        constructor(red: number, green: number, blue: number, color?: string);
        public getValue(): number;
    }
    // tslint:disable-next-line:max-classes-per-file
    export class ColorScene extends Scene {
        constructor(color: Color, bright: number);
        public getData(): any[]
    }

    // tslint:disable-next-line:max-classes-per-file
    export class HsvScene extends Scene {
        constructor(hue: number, satuation: number, brightness: number);
        public getData(): any[];
    }
    /**
     * change the smart LED to specified ct and brightness
     */
    // tslint:disable-next-line:max-classes-per-file
    export class CtScene extends Scene {
        /**
         * @constructor
         * @param temperature : K temperature value
         * @param brightness  max brightness level
         */
        constructor(temperature: number, brightness: number);
        public getData(): any[];
    }

    // tslint:disable-next-line:max-classes-per-file
    export class CfScene extends Scene {
        /**
         * @constructor
         * @param flowAction The LED behavior after flow finish
         * @param states : The set of state changes
         * @param repeat : number of repeas. 0 is infinity
         */
        constructor(flowAction: StartFlowAction, states: FlowState[], repeat: number);
        public getData(): any[]
    }

    export interface IConfig {
        lightIp?: string;
        lightPort?: number;
        debug?: boolean;
        timeout?: number;
        // default is 55443
    }
    export interface ILogger {
        info: (message: string, data?: any) => void;
        error: (message: string, data?: any) => void;
        debug: (message: string, data?: any) => void;
        log?: (message: string, data?: any) => void;
    }

    export class Yeelight {
        public connected: boolean;

        private sentCommands: Command[];
        private resultCommands: ICommandResult[];
        /**
         * @constructor
         * @param {IConfig} options : The client config initial the client
         */
        constructor(options: IConfig, logger?: ILogger);
        public onMessage(msg: Buffer): void;
        /**
         * Drop connection/listerners and clean up resources.
         */
        public disconnect(): Promise<any>;
        /**
         * establish connection to light,
         * @returns return promise of the current instance
         */
        public connect(): Promise<Yeelight>;
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
        public setPower(turnOn: boolean, effect: "smooth" | "sudden", duration: number): Promise<IEventResult>;
        /**
         * This method is used to start a timer job on the smart LED.
         * Only accepted if the smart LED is currently in "on" state
         * @param type currently can only be 0. (means power off)
         * @param time the length of the timer (in minutes). Request
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public cronAdd(type: number, time: number): Promise<IEventResult>;
        /**
         * This method is used to retrieve the setting of the current cron job of the specified type.
         * @param type currently can only be 0. (means power off)
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public cronGet(type: number): Promise<IEventResult>;
        /**
         * This method is used to retrieve the setting of the current cron job of the specified type.
         * @param type currently can only be 0. (means power off)
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public cronDelete(type: number): Promise<IEventResult>;
        /**
         * This method is used to toggle the smart LED.
         * This method is used to switch on or off the smart LED (software managed on/off)
         * @returns {Promise<ICommandResult>} Return the promise indicate the command success or reject
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public toggle(): Promise<IEventResult>;
        /**
         *  This method is used to save current state of smart LED in persistent memory.
         *  So if user powers off and then powers on the smart LED again (hard power reset),
         *  the smart LED will show last saved state.
         * For example, if user likes the current color (red) and brightness (50%)
         * and want to make this state as a default initial state (every time the smart LED is powered),
         * then he can use set_default to do a snapshot.
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public setDefault(): Promise<IEventResult>;
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
        public startColorFlow(states: FlowState[], action: StartFlowAction, repeat: number): Promise<IEventResult>;
        /**
         * This method is used to stop a running color flow.
         */
        public stopColorFlow(): Promise<IEventResult>;
        /**
         * This method is used to set the smart LED directly to specified state.
         * If the smart LED is off, then it will turn on the smart LED firstly and then apply the specified command
         * @param scene type of scene to update
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public setScene<T extends Scene>(scene: T): Promise<IEventResult>;
        /**
         * This method is used to retrieve current property of smart LED.
         * @param {string[]} params  The parameter is a list of property names and the response contains a
         * list of corresponding property values.
         * the requested property name is not recognized by smart LED, then a empty string value ("") will be returned.
         * Request Example:     {"id":1,"method":"get_prop","params":["power", "not_exist", "bright"]}
         * Example:  {"id":1, "result":["on", "", "100"]}
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public getProperty(params: DevicePropery[]): Promise<IEventResult>;
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
        public setCtAbx(ct: number, effect: "smooth" | "sudden", duration: number): Promise<IEventResult>;
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
        public setRGB(color: Color, effect: "smooth" | "sudden", duration: number): Promise<IEventResult>;
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
        public setHSV(hue: number, sat: number, effect: "smooth" | "sudden", duration: number): Promise<IEventResult>;
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
        public setBright(brightness: number, effect: "smooth" | "sudden", duration: number): Promise<IEventResult>;
        /**
         * @param command This method is used to change brightness, CT or color of a smart LED without
         * knowing the current value, it's main used by controllers.
         * @param {AdjustType} adjustType the direction of the adjustment. The valid value can be:
         * “increase": increase the specified property
         *  “decrease": decrease the specified property
         * “circle": increase the specified property, after it reaches the max value back to minimum value
         * @param {string} prop  the property to adjust. The valid value can be:
         * “bright": adjust brightness.
         * “ct": adjust color temperature.
         * “color": adjust color.
         * (When “prop" is “color", the “action" can only be “circle", otherwise, it will be deemed as invalid request.)
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public setAdjust(adjustType: AdjustType, prop: "bright" | "color" | "ct"): Promise<IEventResult>;
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
        public setMusic(action: 0 | 1, host: "string", port: number): Promise<IEventResult>;

        /**
         * This method is used to name the device.
         * The name will be stored on the device and reported in discovering response.
         * User can also read the name through “get_prop” method
         * @param {string} name  the name of the device.
         * When using Yeelight official App, the device name is stored on cloud.
         * This method instead store the name on persistent memory of the device, so the two names could be different.
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public setName(name: string): Promise<IEventResult>;
        /**
         * This method is used to adjust the brightness by specified percentage within specified duration.
         * @param {number} percentage the percentage to be adjusted. The range is: -100 ~ 100
         * @param {number} duration the milisecond of animation
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public adjust(type: CommandType.ADJUST_BRIGHT | CommandType.ADJUST_COLOR | CommandType.ADJUST_CT, percentage: number, duration: number): Promise<IEventResult>;
        /**
         * Use this function to send any command to the light,
         * please refer to specification to know the structure of command data
         * @param {Command} command The command to send to light via socket write
         * @returns {Promise<IEventResult>} return a promise of IEventResult
         */
        public sendCommand(command: Command): Promise<IEventResult>;

        public on(event: 'set_rgb', listener: (commandResult: ICommandResult) => void): void;
        public on(event: 'set_toggle', listener: (commandResult: ICommandResult) => void): void;
        public on(event: 'set_ct', listener: (commandResult: ICommandResult) => void): void;
        public on(event: CommandType, listener: (commandResult: ICommandResult) => void): void;
        public on(event: string, listener: (commandResult: ICommandResult) => void): void;
        public emit(event: string, data: any): void;
    }

    /**
 * The class to discover yeelight device on wifi network using UDP package
 * @constructor
 * @param {string} title - Yeelight Discover
 * @param {string} author - samuraitruong@hotmail.com
 */
    export class Discover {
        private devices: IDevice[];
        private timer: any;
        private options: IDiscoverConfig;
        /**
         * @constructor
         * @param {IDiscoverConfig } options discover object include the port and multicast host.
         * see {@link IDiscoverConfig} for more detail
         * @param {ILogger} logger  the application logger which implement of log, info, debug and error function
         */
        constructor(options: IDiscoverConfig, logger?: ILogger);
        /**
         * Try to verify if the light on and listening on the know ip address
         * @param ipAddress : know IP Address of the light.
         */
        public detectLightIP(ipAddress: string): Promise<IDevice>;
        /**
         * Perfrom IP port scan to find an IP with port 55443 open rather than using SSDP discovery method
         * @param {number} startIp=1 The starting IP to scan, default : 1
         * @param {number} endIp=254 The end IP to scan, default : 254
         * @requires {Promise<IDevice | IDevice[]>} promise of list of device found
         */
        public scanByIp(startIp: number, endIp: number): Promise<IDevice | IDevice[]>;
        /**
         * The class to discover yeelight device on wifi network using UDP package
         * You need to turn on "LAN Control" on phone app to get SSDP discover function work
         * @returns {Promise<IDevice | IDevice[]>} a promise that could resolve to 1 or many devices on the network
         */
        public start(): Promise<IDevice | IDevice[]>;
        /**
         * Clean up resource and close all open connection,
         * call this function after you finish your action to avoid memory leak
         * @returns {Promise} return a promise, fullfil will call after internal socket connection dropped
         */
        public destroy(): Promise<void>;
        /**
         * Internal function to handle socket error
         * @param error Error details
         */
        private onError(error: Error);
        /**
         * Generate the UDP message to discover device on local network.
         */
        private getMessage(): Buffer;
        /**
         * The event run when recieved the message devices
         * @param {Buffer} buffer the buffer revieved from the socket
         * @param {AddressInfo} address the TCP info of the devices who send the message
         */
        private onSocketMessage(buffer: Buffer, addressInfo: any);
        /**
         * Add the new discovered device into the internal list
         * @param {IDevice} device - the new device found from network
         * @returns {0 |1 } return 0 if device already existing, 1 if new device added to the list
         */
        private addDevice(device: IDevice): 0 | 1;
        /**
         * Event emit when device found on networks
         * @param {string} event : should be deviceAdded
         * @param {Function} listener callback function to handle device
         */
        public on(event: "deviceAdded", listener: (device: IDevice) => void): void;
        public on(event: string, listener: (info: any) => void): void;

        public emit(event: string, data: any): void;
    }
}