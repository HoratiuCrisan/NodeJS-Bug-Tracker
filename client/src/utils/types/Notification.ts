export interface NotificationObject {
    notifications: Notification[]
}

export interface Notification {
    senderId: string,
    message: string,
    read: boolean,
    timestamp: Date
}