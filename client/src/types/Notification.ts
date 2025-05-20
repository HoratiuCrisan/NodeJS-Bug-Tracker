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