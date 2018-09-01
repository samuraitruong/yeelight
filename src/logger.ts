import { ILogger } from "./models/logger";

export const defaultLogger: ILogger = {
    debug: (message: string, obj: any) => console.debug,
    error: (message: string, obj: any) => console.error,
    info: (message: string, obj: any) => console.info,
    log: (message: string, obj: any) => console.log,
};
