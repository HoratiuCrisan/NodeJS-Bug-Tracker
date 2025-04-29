export type Notification = {
    id: string;
    email?: string;
    timestamp: number;
    type: string;
    message: string;
    read: boolean;
    readAt: null | number;
    data?: unknown;
    sentEmail: boolean;
}

export type NotificationMessage = {
    userId: string;
    email?: string;
    message: string;
    type: string;
    data?: unknown;
}