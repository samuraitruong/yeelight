export interface ILogger {
    info: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    debug: (message: string, data?: any) => void;
    log?: (message: string, data?: any) => void;
}