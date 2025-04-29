import { LogMessage } from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/logging-lib";

export type Ticket = {
    id: string;
};

export type Task = {
    id: string;
};

export type Version = {
    id: string;
    timestamp: number;
    version: number;
    deleted: boolean;
    data: Ticket | Task | LogMessage;
}