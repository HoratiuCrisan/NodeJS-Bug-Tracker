import { Notification, NotificationMessage } from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/notification-lib/src";
import { uuid as uuidv4 } from "uuidv4";
import { NotificationRepository } from "../repository/notificationRepository";
import nodeMailer from "nodemailer";

export class NotificationService {
    private _notificationRepository: NotificationRepository;

    constructor() {
        this._notificationRepository = new NotificationRepository();
    }

    /**
     * 
     * @param {NotificationMessage} notificationMessage The user data and the data of the notification 
     * @returns {Notification} The created notification object
     */
    async createNotification(notificationMessage: NotificationMessage): Promise<Notification> {
        const notification: Notification = {
            id: uuidv4(), /* Generate an ID for the notification */
            email: notificationMessage.email,
            timestamp: Date.now(), /* Generate the timestamp of the notification emittion */
            read: false, /* Mark the notification read status to false */
            readAt: null, /* Mark the read timestamp of the notification to null */
            type: notificationMessage.type,
            message: notificationMessage.message,
            data: notificationMessage.data,
            sentEmail: false, /* Mark the email send field to false */
        };

        /* Check if the type of the notification is of email and if the user email was passed 
            and send the notification to the email of the user */
        if (notificationMessage.type === "email" && notification.email) {
            await this.sendEmaiNotification(notification.email, notification.message, notification.data);
        }

        /* Send the notification data to the repository service to create the notification document */
        return await this._notificationRepository.createNotification(notificationMessage.userId, notification);
    }

    /**
     * 
     * @param {string} userId The ID of the user 
     * @param {string} notificationId The ID of the notification
     * @returns {Promise<Notification>} The notification data
     */
    async getNotification(userId: string, notificationId: string): Promise<Notification> {
        /* Send the data to the repository layer to retrieve the notification document */
        return await this._notificationRepository.getNotification(userId, notificationId);
    }

    /**
     * 
     * @param {string} userId The ID of the user 
     * @param {number} limit The number of notifications to retrieve
     * @param {string | undefined} startAfter The ID of the notification retrieved at the previous fetching request
     * @returns {Promise<Notification[]>} The list of the notifications
     */
    async getUserNotifications(userId: string, limit: number, startAfter?: string): Promise<Notification[]> {
        /* Send the data to the repository layer to retrieve the list of user notifications */
        return await this._notificationRepository.getUserNotifications(userId, limit, startAfter);
    }

    /**
     * 
     * @param {string} userId The ID of the user
     * @param {string} notificationId The ID of the notification
     * @returns {Promise<Notification>} The notification with the updated read status
     */
    async readNotification(userId: string, notificationId: string): Promise<Notification> {
        /* Send the data to the repository layer to update the read status of the notification */
        return await this._notificationRepository.readNotification(userId, notificationId);
    }

    /**
     * 
     * @param {number} date The timestamp after which the notification messages should be deleted
     * @returns {Promise<string>} Completion message
     */
    async deleteNotifications(date: number): Promise<string> {
        /* Get the timestamp in milliseconds */
        const N_DAYS_AGO = Date.now() - date * 24 * 60 * 60 * 1000; 

        /* Send the data to the repository layer to delete the old notifications */
        return await this._notificationRepository.deleteNotifications(N_DAYS_AGO);
    }

    async sendEmaiNotification(email: string, message: string, data: unknown) {
        nodeMailer.createTransport({
            host: "smtp.ethereal.email",
            port: 465,
            secure: true,
            auth: {

            }
        })
    }
}