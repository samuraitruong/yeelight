import { Command } from "./command";
import { ICommandResult } from "./command-result";
import { CommandType } from "./enums";
export interface IEventResult {
    action: CommandType;
    command: Command;
    result: ICommandResult;
    success: boolean;
}