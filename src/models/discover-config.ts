import { IDevice } from "./device";
import { CommandType } from "./enums";
/**
 * The options that use to discover devices on lan network
 */
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