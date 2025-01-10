import { LogMessage, SystemMessage } from "#/utils/interfaces/Log";
import CustomRequest from "#/utils/interfaces/Error";
import { Response } from "express";
import { TicketObject } from "#/utils/interfaces/Ticket";

export async function logRequest(
    req: CustomRequest,
    res: Response,
    type: "info" | "audit" | "error",
    startTime: number,
    message: string,
    createdData?: TicketObject,
    previousData?: TicketObject,
    updatedData?: TicketObject
) : Promise<LogMessage> {
    if (!req.user) {
        throw new Error(`Invalid user data`);
    }

    const executionTime = Date.now() - startTime;

    const logMessage: LogMessage = {
        type,
        message,
        actor: {
            "uid": req.user.user_id,
            "username": req.user.name,
            "role": req.user.role,
        },
        details: {
            method: req.method,
            endpoint: req.originalUrl,
            status: res.statusCode,
        },
        timestamp: new Date(startTime).toUTCString(),
        duration: `${executionTime}ms`,
    }

    if (createdData) {
        logMessage.data = {
            createdData: {
                id: createdData.id,
                ...createdData.data,
            },
        }
    }

    if (previousData && updatedData) {
        logMessage.data = {
            previousData: {
                id: previousData.id,
                ...previousData.data
            },
            updatedData: {
                id: previousData.id, 
                ...updatedData.data
            },
        }
    }
    
    return logMessage;
}

export function logSystemMessage(
    type: "audit"| "info" | "error",
    message: string,
) {
    const logMessage: SystemMessage = {
        type,
        message,
        timestamp: new Date().toUTCString(),
    }

    return logMessage;
}