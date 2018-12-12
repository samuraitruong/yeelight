export interface IConfig {
    lightIp: string;
    /** default port is 55443 */
    lightPort?: number;
    debug?: boolean;
    timeout?: number;
}
