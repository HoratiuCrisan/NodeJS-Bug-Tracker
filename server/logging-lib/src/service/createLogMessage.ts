import { v4 } from "uuid";
import { LogMessage } from "../types/Log";

export const createLogMessage = (
    message: string,
    type: string,
    timestamp: number,
    status: number,
    duration: number,
    method: string,
    endpoint: string,
    user: {
        id: string,
        email: string,
        role: string,
        displayName: string,
    },
    data: unknown,
) : LogMessage => {
    const log: LogMessage = {
        id: v4(),
        message,
        type,
        timestamp,
        requestDetails: {
            method,
            endpoint,
            duration,
            status,
        },
        user,
        data,
    };

    return log;
}