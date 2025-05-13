import { v4 } from "uuid";
import { LogMessage, LogUser } from "../types/Log";

/**
 * 
 * @param {string} message The text message of the log
 * @param {string} type The type of log
 * @param {number} timestamp The time when the log was generated
 * @param {string} status The status of the request
 * @param {number} duration The duration of the request
 * @param {string} method The api method
 * @param {string} endpoint The api endpoint
 * @param {LogUser} user The data of the user that sent the request
 * @param {unknown} data The additional log data from the request
 * @returns {LogMessage} The log message object
 */
export const createLogMessage = (
    message: string,
    type: string,
    timestamp: number,
    status: number,
    duration: number,
    method: string,
    endpoint: string,
    user: LogUser,
    data: unknown,
) : LogMessage => {
    /* Generate teh log message object */
    const log: LogMessage = {
        id: v4(), /* Generate a new log ID using uuid */
        message,
        type,
        timestamp,
        requestDetails: { /* Add the api data with the status and the duration of the request */
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