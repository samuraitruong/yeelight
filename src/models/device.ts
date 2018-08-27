import { ColorMode, DeviceStatus } from "./enums";
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