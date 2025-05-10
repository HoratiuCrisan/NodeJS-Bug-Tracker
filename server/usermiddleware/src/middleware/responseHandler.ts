import {  LogProducer, LogMessage } from "@bug-tracker/logging-lib";
import { NotificationMessage, NotificationProducer } from "@bug-tracker/notification-lib/src";
import { Response } from "express";
import { VersionDetails } from "../types/User";

const logger = new LogProducer();
const notification = new NotificationProducer();

export async function responseHandler(
    message: string,
    httpCode: number,
    responseData: unknown,
    res: Response,
    logData?: LogMessage,
    notificationsData?: NotificationMessage[],
    versionDetails?: VersionDetails
) { 
    if (logData) {
        await logger.assertToLogQueue("logger", logData);
    }

    if (notificationsData) {
        notificationsData.forEach(async (notificationData: NotificationMessage) => {
            await notification.assertQueue("notifications", notificationData);
        });
    }

    if (versionDetails) {
        // Send data to the version producer
    }

    res.status(httpCode).json({
        success: true,
        message,
        data: responseData,
    });
}