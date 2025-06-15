export type Notification = {
    id: string;
    email: string | null;
    timestamp: number;
    type: string;
    message: string;
    read: boolean;
    readAt: null | number;
    data?: any;
    channel: "tickets" | "tasks" | "projects" | "messages";
    sentEmail: boolean;
}