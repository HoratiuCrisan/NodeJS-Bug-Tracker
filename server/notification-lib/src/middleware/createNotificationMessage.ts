import { NotificationMessage } from "../types/notification";

export function createNotificationMessage (
    userId: string,
    email: string,
    type: string,
    message: string,
    data: unknown,
): NotificationMessage {
    const notification: NotificationMessage = {
        userId,
        email,
        type,
        message,
        data
    };

    return notification;
}