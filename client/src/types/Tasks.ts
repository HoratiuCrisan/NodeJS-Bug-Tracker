import { User } from "./User";

export type Task = {
    id: string;
    projectId: string;
    authorId: string;
    handlerIds: string[];
    description: string;
    status: string;
    deadline: number;
    createdAt: number;
    completedAt: number | null;
};

export type Subtask = {
    id: string;
    taskId: string;
    authorId: string;
    handlerId: string;
    description: string;
    createdAt: number;
    done: boolean;
};

export type Response = {
    id: string;
    taskId: string;
    authorId: User;
    message: string;
    timestamp: number;
};

export type TaskCard = {
    task: Task;
    users: User[];
};

export type SubtaskCard = {
    subtask: Subtask,
    users: User[];
}