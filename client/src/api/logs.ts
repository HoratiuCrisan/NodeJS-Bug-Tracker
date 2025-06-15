import { getAxiosInstance } from "./axiosInstance";
import { LogMessage } from "../types/Logs";
import { env } from "../utils/evnValidation";

/* Initializd the axios instance for the logs service */
const axios = getAxiosInstance(env.REACT_APP_LOGS_END_POINT);

/* POST requests */

/* GET requests */

/**
 * 
 * @param logId The ID of the log
 * @param day The day when the log was created
 * @param type The type of log
 * @returns {Promise<LogMessage>} The log message object
 */
const getLog = async (logId: string, day: string, type: string): Promise<LogMessage> => {
    /* Send the request to the logs service */
    const response = await axios.get(`/${day}/${type}/${logId}`);

    /* Return the response data */
    return response.data.data as LogMessage;
}

/**
 * 
 * @param {string} day The day when the logs were created
 * @param {string} type The type of logs
 * @param {number} limit The number of log messages to be retrieved
 * @param {string | undefined} startAfter The ID of the last log retrieved at the previous fetching reqeust
 * @returns {Promise<LogMessage[]>} The log message objects
 */
const getLogs = async (day: string, type: string, limit: number, startAfter?: string): Promise<LogMessage[]> => {
    /* Send the reqeust to the logs server */
    const response = await axios.get(`/${day}/${type}?limit=${limit}&startAfter=${startAfter}`);

    /* Return the response data */
    return response.data.data as LogMessage[];
}

/* PUT requests */

/**
 * 
 * @param {string} logId The ID of the log
 * @param {string} day The day when the log was created
 * @param {string} type The type of log
 * @param {LogMessage} log The new log data
 * @returns {Promise<LogMessage>} The updated log object
 */
const updateLog = async (logId: string, day: string, type: string, log: LogMessage): Promise<LogMessage> => {
    /* Send the reqeust to the logs server */
    const response = await axios.put(`/${day}/${type}/${logId}`, log);

    /* Return the response data */
    return response.data.data as LogMessage;
}

/* DELETE requests */

/**
 * 
 * @param {string} logId The ID of the log to be deleted
 * @param {string} day The day when the log was created
 * @param {string} type The type of log
 * @returns {Promise<string>} The success message
 */
const deleteLog = async (logId: string, day: string, type: string): Promise<string> => {
    /* Send the reqeust to the logs server */
    const response = await axios.delete(`/${day}/${type}/${logId}`);

    /* Return the response data */
    return response.data.data;
}

export {
    getLog,
    getLogs,
    updateLog,
    deleteLog,
};