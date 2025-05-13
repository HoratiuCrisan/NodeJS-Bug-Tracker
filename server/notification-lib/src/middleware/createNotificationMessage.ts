import { NotificationMessage } from "../types/notification";

/**
 * 
 * @param userId The ID of the user that receives the notification
 * @param email The email of the user that receives the notification
 * @param message The message of the notification
 * @param type The type of notification
 * @param data The data of the notification
 * @returns {NotificationMessage} The notification message object
 */
export function createNotificationMessage (
    userId: string,
    email: string | undefined,
    message: string,
    type: string,
    data: unknown,
): NotificationMessage {
    /* Generate a new notification message object */
    const notification: NotificationMessage = {
        userId: userId,
        email: email,
        message: message,
        type: type,
        data: data,
    };

    return notification;
}