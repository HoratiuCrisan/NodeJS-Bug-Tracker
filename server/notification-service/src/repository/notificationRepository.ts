import admin from "../../config/firebase";
import { Notification } from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/notification-lib/src";
import {AppError, executeWithHandling} from "@bug-tracker/usermiddleware";
import env from "dotenv";
env.config();

const db = admin.firestore();

export class NotificationRepository {
    private _dbNotifications: string;

    constructor() {
        if (!process.env.NOTIFICATION_COLLECTION) {
            throw new AppError(`InvalidEnvData`, 400, `Invalid env. data`);
        }
        this._dbNotifications = process.env.NOTIFICATION_COLLECTION;
    }

    /**
     * 
     * @param {string} userId The ID of the user that is the receiver of the notification message 
     * @param {Notification} notification The notification message
     * @returns {Notification} The created notification message
     */
    async createNotification(userId: string, notification: Notification): Promise<Notification> {
        return executeWithHandling(
            async () => {
                /* Create a new document inside the notifications collection for the user based on the user ID*/
                const notificationRef = db
                    .collection(this._dbNotifications)
                    .doc(userId)
                    .collection(this._dbNotifications)
                    .doc(notification.id);
                
                /* Add the data into the notification document */
                await notificationRef.set(notification);

                /* Return the created notification data */
                return (await notificationRef.get()).data() as Notification;
            },
            `CreateNotificationError`,
            500,
            `Failed to create notification`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user 
     * @param {string} notificationId The ID of the notification
     * @returns {Notification} The data of the retrieved notification
     */
    async getNotification(userId: string, notificationId: string): Promise<Notification> {
        return executeWithHandling(
            async () => {
                /* Access the notification reference based on the user ID and the notification ID*/
                const notificationRef = db
                    .collection(this._dbNotifications)
                    .doc(userId)
                    .collection(this._dbNotifications)
                    .doc(notificationId);

                /* Get the notification document */
                const notificationDoc = await notificationRef.get();

                /* Check if the document exists */
                if (!notificationDoc.exists) {
                    throw new AppError(`NotificationNotFound`, 404, `Notification not found. Failed to retireve notification data`);
                }

                /* Return the data of the notification */
                return notificationDoc.data() as Notification;
            },
            `GetNotificationError`,
            500,
            `Failed to retireve notification`,
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user
     * @param {number} limit The number of notifications to retrieve
     * @param {string | undefined} startAfter The ID of the last notification retrieved at the previous fetching request
     * @returns {Notification[]} The list of retrieved notifications
     */
    async getUserNotifications(userId: string, limit: number, startAfter?: string): Promise<Notification[]> {
        return executeWithHandling(
            async () => {
                /* Get the reference for the notification collection based on the user ID */
                const notificationsRef = db
                    .collection(this._dbNotifications)
                    .doc(userId)
                    .collection(this._dbNotifications);

                /* Order the notifications based on the timestamp */
                let orderedNotifications = notificationsRef.orderBy("timestamp", "desc");

                /* Check if the ID of the last notification was passed */
                if (startAfter) {
                    /* Get the snapshot of the last notification document */
                    const notificationSnapshot = await notificationsRef.doc(startAfter).get();

                    /* Check if the document exists */
                    if (notificationSnapshot.exists) {
                        /* Start the fetching process after the last document */
                        orderedNotifications = orderedNotifications.startAfter(notificationSnapshot);
                    }
                }

                /* Limit the number of notifications to retrieve */
                orderedNotifications = orderedNotifications.limit(limit);

                const notifications: Notification[] = [];

                /* Get teh notification documents collection */
                const notificationsDocs = await orderedNotifications.get();

                /* Map over each notification document and add it to the list created above */
                notificationsDocs.forEach((doc) => {
                    notifications.push(doc.data() as Notification);
                });

                /* Return the list of the retrieved notifications */
                return notifications;
            },
            `GetUserNotificationsError`,
            500,
            `Failed to retrieve user notifications`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user
     * @param {string} notificationId The ID of the notification
     * @returns {Notification} The updated notification data
     */
    async readNotification(userId: string, notificationId: string): Promise<Notification> {
        return executeWithHandling(
            async () => {
                /* Get the notification document reference */
                const notificationRef = db
                    .collection(this._dbNotifications)
                    .doc(userId)
                    .collection(this._dbNotifications)
                    .doc(notificationId);
                
                /* Get the notification document */
                const notificationDoc = await notificationRef.get();

                /* Check if the notification document exists */
                if (!notificationDoc.exists) {
                    throw new AppError(`NotificationNotFound`, 404, `Notification not found. Failed to update notification`);
                }

                /* Mark the read status of the notification to true, and add the time when it was read */
                await notificationRef.update({
                    read: true,
                    readAt: Date.now(),
                }); 

                /* Return the updated notification data */
                return (await notificationRef.get()).data() as Notification;
            },
            `UpdateNotificationError`,
            500,
            `Failed to update notification`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user 
     * @param {string} notificationId The ID of the notification
     * @returns {Notification} The updated notification data
     */
    async sendEmailNotification(userId: string, notificationId: string): Promise<Notification> {
        return executeWithHandling(
            async () => {
                /* Get the reference of the notification document */
                const notificationRef = db
                    .collection(this._dbNotifications)
                    .doc(userId)
                    .collection(this._dbNotifications)
                    .doc(notificationId);
                
                /* Get the notification document */
                const notificationDoc = await notificationRef.get();

                /* Check if the document exists */
                if (!notificationDoc.exists) {
                    throw new AppError(`EmailNotificationNotFound`, 404, `Notification not found. Failed to send email notification`)
                }

                /* Update the status of the sentEmail to true */
                await notificationRef.update({
                    sentEmail: true,
                });

                /* Return the updated notification data */
                return (await notificationRef.get()).data() as Notification;
            },
            `SendEmailNotificationError`,
            500,
            `Failed to send email notification`,
        );
    }

    /**
     * 
     * @param {number} date The timestamp after which the notification should be deleted
     * @returns {string} The success message indicating completion
     */
    async deleteNotifications(date: number): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the snapshot of the users from the notifications collection */
                const userSnapshot = await db.collection(this._dbNotifications).get();

                /* Start the batch operation in order to perform the notification deletion process */
                const batch = db.batch();

                /* Map over each user snapshot document */
                for (const userDoc of userSnapshot.docs) {
                    const userId = userDoc.id;

                    /* Get the reference of the user notification subcollection */
                    const notificationsRef = db
                        .collection(this._dbNotifications)
                        .doc(userId)
                        .collection(this._dbNotifications);
                    
                    /* Get the notification documents older than the date received as a parameter */
                    const oldNotificationsSnapshot = await notificationsRef
                        .where("read", "==", true)
                        .where("readAt", "<", date)
                        .get();
                    
                    /* Queue the notifications to be deleted */
                    oldNotificationsSnapshot.forEach((doc) => {
                        batch.delete(doc.ref);
                    });

                    console.log(`Deleted ${oldNotificationsSnapshot.size} notifications for user ${userId}`);
                }

                /* Commit all batched deletions */
                await batch.commit();
                const message: string = `Notification cleanup completed successfully`;
                
                /* Return the success message */
                return message;
            },
            `DeleteNotificationsError`,
            500,
            `Failed to delete old read notifications`
        ); 
    }
}

