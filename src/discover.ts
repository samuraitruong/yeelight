import { createSocket, Socket } from "dgram";
import { EventEmitter } from "events";
import { address, toBuffer } from "ip";
import * as net from "net";
import { AddressInfo } from "net";
import { checkPortStatus } from "portscanner";
import { defaultLogger } from "./logger";
import { IDevice } from "./models/device";
import { IDiscoverConfig } from "./models/discover-config";
import { ILogger } from "./models/logger";
import { Utils } from "./utils";
process.on("uncaughtException", (err) => {
    console.log(err);
});
/**
 * The class to discover yeelight device on wifi network using UDP package
 * @constructor
 * @param {string} title - Yeelight Discover
 * @param {string} author - samuraitruong@hotmail.com
 */
export class Discover extends EventEmitter {
    private devices: IDevice[];
    private timer: any;
    private options: IDiscoverConfig = {
        debug: true,
        fallback: true,
        host: null,
        limit: 1,
        multicastHost: "239.255.255.250",
        port: 1982,
        timeout: 10000,
    };
    private client: Socket;
    /**
     * @constructor
     * @param {IDiscoverConfig } options discover object include the port and multicast host.
     * see {@link IDiscoverConfig} for more detail
     * @param {ILogger} logger  the application logger which implement of log, info, debug and error function
     */
    constructor(options: IDiscoverConfig, private logger?: ILogger) {
        super();
        this.devices = [];
        this.options = { ...this.options, ...options };
        this.client = createSocket("udp4");
        this.client.on("message", this.onSocketMessage.bind(this));
        this.client.on("error", this.onError.bind(this));
        this.logger = logger || defaultLogger;
    }
    /**
     * Try to verify if the light on and listening on the know ip address
     * @param ipAddress : know IP Address of the light.
     */
    public async detectLightIP(ipAddress: string): Promise<IDevice> {
        const device: Partial<IDevice> = {
            host: ipAddress,
            port: 55443,
        };
        return new Promise<IDevice>((resolve, reject) => {
            checkPortStatus(55443, ipAddress, (err: any, status: any) => {
                if (err || status === "closed") {
                    return resolve(null);
                } else {
                    this.addDevice(device as IDevice);
                    return resolve(device as IDevice);
                }
            });
        });
    }
    /**
     * Perfrom IP port scan to find an IP with port 55443 open rather than using SSDP discovery method
     * @param {number} startIp=1 The starting IP to scan, default : 1
     * @param {number} endIp=254 The end IP to scan, default : 254
     * @requires {Promise<IDevice | IDevice[]>} promise of list of device found
     */
    public async scanByIp(startIp: number = 1, endIp: number = 254): Promise<IDevice | IDevice[]> {
        const localIp = address();
        const count = 0;
        const availabledIps = Utils.getListIpAddress(localIp);
        const promises = availabledIps.map((x) => this.detectLightIP(x));
        await Promise.all(promises);

        if (this.devices.length === 0) {
            return Promise.reject("No device found after all ip scanned");
        }
        return Promise.resolve(this.devices);
    }
    /**
     * The class to discover yeelight device on wifi network using UDP package
     * You need to turn on "LAN Control" on phone app to get SSDP discover function work
     * @returns {Promise<IDevice | IDevice[]>} a promise that could resolve to 1 or many devices on the network
     */
    public start(): Promise<IDevice | IDevice[]> {
        const localIp = address();
        const me = this;
        return new Promise((resolve, reject) => {
            this.logger.debug("discover options: ", this.options);
            this.client.bind(this.options.port, null, () => {
                me.client.setBroadcast(true);
                me.client.send(me.getMessage(), me.options.port, me.options.multicastHost, (err) => {
                    if (err) {
                        this.logger.log("ERROR", err);
                        reject(err);
                    } else {
                        let ts = 0;
                        const interval = 200;
                        me.timer = setInterval(() => {
                            ts += interval;
                            if (this.devices.length >= this.options.limit) {
                                clearInterval(me.timer);
                                resolve(this.devices);
                            }
                            if (this.options.timeout > 0 && this.options.timeout < ts) {
                                if (this.devices.length > 0) {
                                    clearInterval(me.timer);
                                    resolve(this.devices);
                                } else {
                                    clearInterval(me.timer);
                                    if (!this.options.fallback) {
                                        reject("No device found after timeout exceeded : " + ts);
                                    }
                                }
                            }
                            me.client.send(me.getMessage(), me.options.port, me.options.multicastHost);
                            if (ts > this.options.timeout && this.options.fallback) {
                                this.scanByIp().then(resolve).catch(reject);
                            }
                        }, interval);
                    }
                });
            });
        });
    }
    /**
     * Clean up resource and close all open connection,
     * call this function after you finish your action to avoid memory leak
     * @returns {Promise} return a promise, fullfil will call after internal socket connection dropped
     */
    public destroy(): Promise<void> {
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (!this.client) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.removeAllListeners();
            if (this.client) {
                this.client.close(resolve);
            }
        });
    }
    /**
     * Internal function to handle socket error
     * @param error Error details
     */
    private onError(error: Error) {
        this.logger.error("Internal Error ", error);
        this.emit("error", error);
    }
    /**
     * Generate the UDP message to discover device on local network.
     */
    private getMessage(): Buffer {
        // tslint:disable-next-line:max-line-length
        const message = `M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1982\r\nMAN: "ssdp:discover"\r\nST: wifi_bulb\r\n`;
        return Buffer.from(message);
    }
    /**
     * The event run when recieved the message devices
     * @param {Buffer} buffer the buffer revieved from the socket
     * @param {AddressInfo} address the TCP info of the devices who send the message
     */
    private onSocketMessage(buffer: Buffer, addressInfo: AddressInfo) {
        const message = buffer.toString();
        if (this.options.debug && this.logger) {
            this.logger.info(message);
        }
        const device = Utils.parseDeviceInfo(message);
        if (device) {
            this.addDevice(device);
        }
    }
    /**
     * Add the new discovered device into the internal list
     * @param {IDevice} device - the new device found from network
     * @returns {0 |1 } return 0 if device already existing, 1 if new device added to the list
     */
    private addDevice(device: IDevice): 0 | 1 {
        const existDevice = this.devices.findIndex((x) => x.id === device.id);
        if (existDevice <= 0) {
            this.devices.push(device);
            this.emit("deviceAdded", device);

            return 1;
        }
        this.devices[existDevice] = device;
        return 0;
    }
}