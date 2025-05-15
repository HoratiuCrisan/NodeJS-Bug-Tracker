import { Ticket } from "./Ticket";
import { Task, Subtask} from "./Tasks";

export type Version = {
    id: string;
    timestamp: number;
    version: number;
    deleted: boolean;
    data: Ticket | Task | Subtask;
}