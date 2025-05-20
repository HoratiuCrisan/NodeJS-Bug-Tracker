import { Ticket } from "./Ticket";
import { Task, Subtask} from "./Tasks";

export type TicketVersion = {
    id: string;
    timestamp: number;
    version: number;
    deleted: boolean;
    data: Ticket;
}

export type TaskVersion = {
    id: string;
    timestamp: number;
    version: number;
    deleted: boolean;
    data: Task;
}


export type SubtaskVersion = {
    id: string;
    timestamp: number;
    version: number;
    deleted: boolean;
    data: Subtask;
}