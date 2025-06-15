import { CustomRequest, validateData, measureTime, handleResponseSuccess } from "@bug-tracker/usermiddleware";
import { Response, NextFunction } from "express";
import { NotificationService } from "../service/notificationService";
import {
    getNotificationSchema,
    getUserNotificationsSchema,
    updateNotificationSchema,
    getUnreadNotificationsSchema,
} from "../schemas/notificationSchemas";

const notificationService = new NotificationService();

export class NotificationController {
    static async getNotification(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    notificationId: req.params.notificationId, /* The ID of the notification */
                },
                getNotificationSchema, /* The schema for the request */
            );

            /* Send the data to the service layer to retrieve the notification data */
            const { data: notification, duration } = await measureTime(
                async () => notificationService.getNotification(inputData.userId!, inputData.notificationId),
                `Get-notification-data`
            );

            /* Generate teh log data */
            const logDetails = {
                message: `User "${inputData.userId}" retrieved the data of the notification "${inputData.notificationId}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: notification,
            };

            /* Return the data and the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Notification retrieved successfully`,
                data: notification,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserNotifications(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    limit: Number(req.query.limit), /* The number of notifications to retrieve */
                    startAfter: req.query.startAfter, /* The ID of the last notification retrieved */
                },
                getUserNotificationsSchema, /* The validation schema */
            );

            let lastNotificationId = undefined;

            /* Check if the ID of the last notification was sent */
            if (inputData.startAfter) {
                /* Convert the ID of the notification to a string if it was sent */
                lastNotificationId = String(inputData.startAfter);
            }

            /* Send the data to the service layer to retrieve the list of notifications */
            const { data: notifications, duration } = await measureTime(async () => notificationService.getUserNotifications(
                inputData.userId!, 
                inputData.limit, 
                lastNotificationId
            ), `Get-user-notifications`);

            /* Generate the log data */
            const logDetails = {
                message: `User "${inputData.userId}" retrieved "${inputData.limit}" notifications`,
                type: `audit`,
                user: req.user!,
                status: 201,
                duration,
                data: notifications,
            }

            /* Return the notifications list with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Notifications retrieved successfully`,
                data: notifications,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUnreadNotifications(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id,
                },
                getUnreadNotificationsSchema,
            );

            const { data: notifications, duration } = await measureTime(
                async () => notificationService.getUnreadNotifications(inputData.userId!),
                "Get-Unread-Notifications"
            );

            const logDetails = {
                message: `User "${inputData.userId}" retrieved the unread notifications`,
                type: `info`,
                user: req.user!,
                status: 201,
                duration,
                data: notifications,
            }

            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Unread notificatiosn retrieved successfully`,
                data: notifications,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async readNotification(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    notificationId: req.params.notificationId, /* The ID of the notification */
                },
                updateNotificationSchema, /* The validation schema */
            );

            /* Send the data to the service layer to update the status of the notification */
            const { data: notification, duration } = await measureTime(
                async () => notificationService.readNotification(inputData.userId!, inputData.notificationId),
                `Read-notification`
            );

            /* Generate the notification data */
            const logDetails = {
                message: `Notification "${inputData.notificationId}" read by "${inputData.userId}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: notification,
            };

            /* Return the updated notification data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Notification read successfully`,
                data: notification,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }
}