import { createSocket, Socket } from "dgram";
import { EventEmitter } from "events";
import { AddressInfo } from "net";
import { Logger } from "winston";
import { IDevice } from "./models/device";
import { IDiscoverConfig } from "./models/discover-config";
import { Utils } from "./utils";

/**
 * The class to discover yeelight device on wifi network using UDP package
 * @constructor
 * @param {string} title - Yeelight Discover
 * @param {string} author - .
 */
export class Discover extends EventEmitter {
    private options: IDiscoverConfig = {
        asPromise: true,
        debug: true,
        host: "127.0.0.1",
        multicastHost: "239.255.255.250",
        port: 1982,
    };
    private client: Socket;
    constructor(options: IDiscoverConfig, private logger?: Logger) {
        super();
        this.options = { ...this.options, ...options };
        this.client = createSocket("udp4");
        this.client.on("message", this.onSocketMessage.bind(this));
    }
    /**
     * The class to discover yeelight device on wifi network using UDP package
     * @constructor
     * @param {string} title - Yeelight Discover
     * @param {string} author - .
     */
    public start(): void {
        const me = this;
        this.client.bind(this.options.port, this.options.host, () => {
            me.client.setBroadcast(true);
            me.client.send(me.getMessage(), me.options.port, me.options.multicastHost, (err) => {
                if (err) {
                    console.log("ERROR", err);
                }
            });
        });

        return null;
    }
    private getMessage(): Buffer {
        // tslint:disable-next-line:max-line-length
        const message = `M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1982\r\nMAN: "ssdp:discover"\r\nST: wifi_bulb\r\n`;
        return Buffer.from(message);
    }
    private onSocketMessage(buffer: Buffer, address: AddressInfo) {
        const message = buffer.toString();
        if (this.options.debug && this.logger) {
            this.logger.info(message);
        }
        const device = Utils.parseDeviceInfo(message);
        if (device) {
            this.emit("deviceAdded", device);
        }
    }
}