import { Notification, NotificationMessage } from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/notification-lib/src";
import { NotificationRepository } from "../repository/notificationRepository";
import nodeMailer from "nodemailer";
import {v4} from "uuid";
import env from "dotenv";
import { AppError } from "@bug-tracker/usermiddleware";
import { notificationSocketService } from "./socketService";
env.config();

export class NotificationService {
    private _notificationRepository: NotificationRepository;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.GMAIL_ADDRESS || !process.env.GMAIL_PASSWORD) {
            throw new AppError(`InvalidEnvData`, 500, `Invalid env gmail service data`);
        }

        this._notificationRepository = new NotificationRepository();
    }

    /**
     * 
     * @param {NotificationMessage} notificationMessage The user data and the data of the notification 
     * @returns {Notification} The created notification object
     */
    async createNotification(notificationMessage: NotificationMessage): Promise<Notification | null> {
        const notification: Notification = {
            id: v4(), /* Generate an ID for the notification */
            email: notificationMessage.email ?? null,
            timestamp: Date.now(), /* Generate the timestamp of the notification emittion */
            read: false, /* Mark the notification read status to false */
            readAt: null, /* Mark the read timestamp of the notification to null */
            type: notificationMessage.type,
            message: notificationMessage.message,
            data: notificationMessage.data,
            channel: notificationMessage.channel,
            sentEmail: false, /* Mark the email send field to false */
        };

        /* Check if the type of the notification is of email and if the user email was passed 
            and send the notification to the email of the user */
        if (notificationMessage.type === "email" && notification.email !== null) {
            await this.sendEmaiNotification(notification.email, notification.message, notification.data);

            return null;
        } 
            notificationSocketService.emitToUser(notificationMessage.userId, "new-notification", notification);

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

    async getUnreadNotifications(userId: string): Promise<Notification[]> {
        return await this._notificationRepository.getUnreadNotifications(userId);
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

    /**
     * 
     * @param {string} email The email address of the user to be sent the message
     * @param {string} message The text message of the notification
     * @param {unknown} data The data of the message
     */
    async sendEmaiNotification(email: string, message: string, data: unknown) {
        if (!email || typeof email !== "string" || !email.trim()) {
            console.log(`Sending email to ${email}`);
            return;
        }
        /* Create a new nodemailer tranpsorter with the gmail service */
        const transporter = nodeMailer.createTransport({
            service: "gmail",
            port: 587, 
            secure: false, 
            /* The data of the provider */
            auth: {
                user: process.env.GMAIL_ADDRESS,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        /* Send the email notification to the user */
        await transporter.sendMail({
            from: `"Bug-tracker" <${process.env.GMAIL_ADDRESS}>`,
            to: email,
            subject: message,
            text: JSON.stringify(data),
        });
    }
}