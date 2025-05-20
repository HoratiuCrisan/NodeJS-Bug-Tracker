import {  LogProducer, LogMessage } from "@bug-tracker/logging-lib";
import { NotificationMessage, NotificationProducer } from "@bug-tracker/notification-lib/src";
import { VersionProducer } from "@bug-tracker/version-lib/src";
import { Response } from "express";
import { VersionDetails } from "../types/User";
import { AppError } from "../utils/appError";
import env from "dotenv";
env.config();

/* Verify if the env data was initialized */
//if (!process.env.LOG_QUEUE || !process.env.NOTIFICATION_QUEUE || !process.env.VERSION_QUEUE) {
//    throw new AppError(`InvalidEnvData`, 500, `Failed to initialize usermiddleware env data`);
//}

/* Initialize the producers */
const logger = new LogProducer();
const notification = new NotificationProducer();
const versionProducer = new VersionProducer();

/**
 * 
 * @param { string } message The text message to be return with the response
 * @param { number } httpCode The http code of the response
 * @param { unknown } responseData The data returned with the response
 * @param { Response } res The response
 * @param { LogMessage } logData The data of the log
 * @param { NotificationMessage[] | undefined} notificationsData The list of notifications
 * @param { VersionDetails | undefined } versionDetails The data of the item version
 */
export async function responseHandler(
    message: string,
    httpCode: number,
    responseData: unknown,
    res: Response,
    logData?: LogMessage,
    notificationsData?: NotificationMessage[],
    versionDetails?: VersionDetails
) { 
    /* Return the success message and the response data */
   if (!res.headersSent) {
        res.status(httpCode).json({
            success: true,
            message,
            data: responseData,
        });
    } else {
        console.warn("[responseHandler] Response already sent!");
    }

    try {
        /* If the method sent a log message, assert it to the log producer */
        if (logData) {
            await logger.assertToLogQueue(`logger`, logData);
        }

        /* If the method sent notification messages, iterate over each message and assert it to the notification producer */
        if (notificationsData) {
            notificationsData.forEach(async (notificationData: NotificationMessage) => {
                await notification.assertQueue(`notifications`, notificationData);
            });
        }

        /* If the method sent an item version, assert it to the version producer */
        if (versionDetails) {
            await versionProducer.assertToQueue(`versions`, versionDetails);
        }
    } catch (error) {
        throw new AppError(`RabbitmqProducerError`, 500, `Failed to send some data to rabbitmq: ${error}`);
    }
}