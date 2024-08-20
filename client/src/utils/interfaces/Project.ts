export interface Project {
    ID: string;
    Title: string;
    Description: string;
    CreationDate: string;
    ProjectManager: User;
    Creator: string;
    Members: User[];
    Files: {
        File: File | null;
        FileName: string;
    }[];
    TaskList: Task[];
    Code: number;
}

export interface User {
    DisplayName: string;
    Email: string;
    Roles: string[];
    PhotoUrl: string;
}

export interface Task {
    Title: string;
    Description: string;
    Response: string;
    CreationDate: string;
    Deadline: string;
    Status: string;
    Creator: string;
    Handler: string;
    CreatorProfileURL: string | undefined;
    HandlerProfileURL: string | undefined;
    Files: {
        File: File | null;
        FileName: string;
    }[];
}