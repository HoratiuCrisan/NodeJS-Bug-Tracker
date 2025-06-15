import { User } from "./User";

export type Project = {
    id: string;
    title: string;
    description: string;
    projectManagerId: string;
    memberIds: string[];
    createdAt: number;
    code: string;
}

export type ProjectCardType = {
    members: User[];
    projectManager: User;
    data: Project;
};