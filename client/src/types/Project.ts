export type Project = {
    id: string;
    title: string;
    description: string;
    projectManagerId: string;
    memberIds: string[];
    createdAt: number;
    code: string;
}