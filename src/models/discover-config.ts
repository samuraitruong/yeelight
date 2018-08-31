export interface IDiscoverConfig {
    asPromise: boolean;
    port: number;
    host?: string;
    multicastHost?: string;
    debug: boolean;
}