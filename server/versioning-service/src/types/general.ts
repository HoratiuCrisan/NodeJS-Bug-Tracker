import { LogMessage } from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/logging-lib";

export type Ticket = {
    id: string;
    authorId: string;
    handlerId: string | null; 
    title: string;
    description: string;
    priority: string;
    status: string;
    type: string;
    response: string | null;
    createdAt: number;
    closedAt: number | null;
    deadline: number;
    files: {
        file: File;
        fileName: string;
    }[];
    notified: boolean;
};

export type Task = {
    id: string;
    authorId: string;
    handlerIds: string[];
    proejctId: string;
    status: string;
    description: string;
    createdAt: number;
    deadline: number;
};

export type Subtask = {
    id: string;
    taskId: string;
    authorId: string;
    handlerId: string;
    description: string;
    createdAt: number;
    done: boolean;
}

export type Version = {
    id: string;
    timestamp: number;
    version: number;
    deleted: boolean;
    data: Ticket | Task | Subtask;
}

export type VersionObject = {
    id: string;
    type: string;
    data: Ticket | Task | Subtask;
}