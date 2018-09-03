export interface ICommandResult {
    id: number;
    success: boolean;
    results: any[];
    result: any[];
    error?: { code: number, message: string };
}