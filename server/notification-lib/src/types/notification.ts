export type Notification = {
    id: string;
    email: string | null;
    timestamp: number;
    type: string;
    message: string;
    read: boolean;
    readAt: null | number;
    data?: unknown;
    sentEmail: boolean;
    channel: "tickets" | "tasks" | "projects" | "messages";
}

export type NotificationMessage = {
    userId: string;
    email?: string;
    message: string;
    type: string;
    channel: "tickets" | "tasks" | "projects" | "messages";
    data?: unknown;
}