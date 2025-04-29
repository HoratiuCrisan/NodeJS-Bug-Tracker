import { LogMessage, createLogMessage } from "@bug-tracker/logging-lib";
import { createNotificationMessage, NotificationMessage } from "@bug-tracker/notification-lib/src";
import { CustomRequest } from "./customRequest";
import { responseHandler } from "../middleware/responseHandler";
import { Response } from "express";
import { FirebaseUser } from "../types/User";

type NotificationDetails = {
    users: {
        id: string,
        email: string,
        message: string,
    }[],
    type: string,
    data: unknown,
};

type LogDetails = {
    message: string,
    type: string,
    status: number,
    duration: number,
    user: FirebaseUser,
    data: unknown,
}

export async function handleResponseSuccess({
    req,
    res,
    httpCode,
    message,
    data,
    logDetails,
    notificationDetails,
}: {
    req: CustomRequest,
    res: Response,
    httpCode: number,
    message: string,
    data: unknown,
    logDetails?: LogDetails
    notificationDetails?: NotificationDetails
}) {
    let logMessage: LogMessage | undefined;
    let notificationMessages: NotificationMessage[] | undefined;

    if (logDetails) {
        logMessage = createLogMessage(
            logDetails.message,
            logDetails.type,
            Date.now(),
            logDetails.status,
            logDetails.duration,
            req.method,
            req.url,
            {
                id: logDetails.user.user_id,
                email: logDetails.user.email,
                role: logDetails.user.role,
                displayName: logDetails.user.name,
            },
            data,
        )
    }

    if (notificationDetails) {
        notificationMessages = [];
        notificationDetails.users.forEach((user) => {
            const message = createNotificationMessage(
                user.id,
                user.email,
                user.message,
                notificationDetails.type,
                notificationDetails.data,
            );

            notificationMessages?.push(message);
        })
    }

    await responseHandler(message, httpCode, data, res, logMessage, notificationMessages);
}