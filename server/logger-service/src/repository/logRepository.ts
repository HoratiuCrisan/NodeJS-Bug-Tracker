import { AppError  } from "@bug-tracker/usermiddleware";
import admin from "../../config/firebase";
import { executeWithHandling} from "@bug-tracker/usermiddleware"
import { LogMessage } from "../../../logging-lib/src";

const db = admin.firestore();

export class LogRepository {
    private _dbLogsCollection = "Logs";

    /**
     * 
     * @param {LogMessage} log The log data
     * @returns {Promise<LogMessage>} The data of the log after it being added to the database
     */
    async createLog(logDay: string, log: LogMessage): Promise<LogMessage> {
        return executeWithHandling(
            async () => {
                /* Create a new Log document */
                const logRef = db
                    .collection(this._dbLogsCollection)
                    .doc(logDay)
                    .collection(log.type)
                    .doc(log.id);

                /* Add the Log data to the document */
                await logRef.set(log);

                /* Return the log data */
                return (await logRef.get()).data() as LogMessage;
            },
            `CreateLogError`,
            500,
            `Failed to create log`
        );
    }

    /**
     * 
     * @param {string} logId The ID of the Log document
     * @param {string} day The day with the collection of Log messages
     * @returns {Promise<LogMessage>} The retrieved Log data
     */
    async getLog(logId: string, day: string, type: string): Promise<LogMessage> {
        return executeWithHandling(
            async () => {
                /* Get the Log reference */
                const logRef = db
                    .collection(this._dbLogsCollection)
                    .doc(day)
                    .collection(type)
                    .doc(logId);

                /* Get the Log document */
                const logDoc = await logRef.get();

                /* Check if the Log document exists */
                if (!logDoc.exists) {
                    throw new AppError(`LogNotFound`, 404, `Log not found. Failed to retrieve log data`);
                }

                /* Return the Log data */
                return logDoc.data() as LogMessage;
            },
            `GetLogError`,
            500,
            `Failed to retrieve log data`
        );
    }

    /**
     * 
     * @param {string} day The day with the collection of Log messages
     * @param {string} type The type of log to retrieve
     * @param {number} limit The number of logs retrieved at a time 
     * @param {string | undefined} startAfter The ID of the Log retrieved at the previous fetch 
     * @returns {Promise<LogMessage[]>} The list of Logs
     */
    async getLogs(day: string, type: string, limit: number, startAfter: string | undefined): Promise<LogMessage[]> {
        return executeWithHandling(
            async () => {
                /* Get the logs reference */
                const logsRef = db
                    .collection(this._dbLogsCollection)
                    .doc(day)
                    .collection(type);

                /* Order logs by timestamp */
                let orderedLogs = logsRef.orderBy("timestamp", "desc");

                /* Check if the ID of the last log was passed */
                if (startAfter) {
                    /* Get the document of the last log fetched */
                    const logsSnapshot = await logsRef.doc(startAfter).get();
                    
                    /* If the log document exists, start the fetching process after it */
                    if (!logsSnapshot.exists) {
                        orderedLogs = orderedLogs.startAfter(logsSnapshot);
                    }
                }

                /* Limit the number of logs retrieved at a time */
                orderedLogs = orderedLogs.limit(limit);

                const logs: LogMessage[] = [];

                /* Get the collection of logs documents */
                const logsDoc = await orderedLogs.get();

                /* Map over each document and add each log to the list */
                logsDoc.forEach((doc) => {
                    logs.push(doc.data() as LogMessage);
                });

                /* Return the logs list */
                return logs;
            },
            `GetLogsError`,
            500,
            `Failed to get logs`
        );
    }

    /**
     * 
     * @param {string} logId The ID of the log to update
     * @param {string} day The day when the log was created
     * @param {string} type The type of log
     * @param {LogMessage} log The new log data 
     * @returns {Promise<LogMessage>} The updated log data
     */
    async updateLog(logId: string, day: string, type: string, log: LogMessage): Promise<LogMessage> {
        return executeWithHandling(
            async () => {
                /* Get the log reference */
                const logRef = db
                    .collection(this._dbLogsCollection)
                    .doc(day)
                    .collection(type)
                    .doc(logId);

                /* Get the log document */
                const logDoc = await logRef.get();

                /* Check if the log exists */
                if (!logDoc.exists) {
                    throw new AppError(`LogNotFound`, 404, `Log not found. Failed to update log data`);
                }

                /* Update the log data */
                await logRef.update({
                    ...log
                });

                /* Return the udpated log data */
                return (await logRef.get()).data() as LogMessage;
            },  
            `UpdateLogError`,
            500,
            `Failed to update log data`,
        );
    }

    /**
     * 
     * @param {string} day The name of the collection, day when the Log was created
     * @param {string} logId The ID of the Log to be deleted
     * @returns {Promise<string>} "OK" if the Log was deleted
     */
    async deleteLog(logId: string, day: string, type: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the Log reference */
                const logRef = db
                    .collection(this._dbLogsCollection)
                    .doc(day)
                    .collection(type)
                    .doc(logId);

                /* Get the Log document */
                const logDoc = await logRef.get();

                /* Check if the document exits */
                if (!logDoc.exists) {
                    throw new AppError(`LogNotFound`, 404, `Log not found. Failed to delete Log data`);
                }

                /* Delete the document */
                await logRef.delete();

                /* Return an "OK" message to confirm the Log deletion */
                return "OK";
            },
            `DeleteLogError`,
            500,
            `Failed to delete Log data`
        );
    }
}