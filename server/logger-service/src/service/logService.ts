import { LogRepository } from "../repository/logRepository";
import { LogMessage } from "@bug-tracker/logging-lib"

export class LogService {
    private _logRepository: LogRepository;

    constructor() {
        this._logRepository = new LogRepository();
    }

    /**
     * 
     * @param {LogMessage} log The data of the log to be created
     * @returns {Promise<LogMessage>} The data of the log
     */
    async createLog(log: LogMessage): Promise<LogMessage> {
        /* Get the day when the log was created */
        const currentDate = this.getCurrentDate();

        /* Send the data to the service layer to create the log */
        return await this._logRepository.createLog(currentDate, log);
    }

    /**
     * 
     * @param {string} logId The ID of the log to retrieve
     * @param {string} day The day when the log was created
     * @param {string} type The type of log
     * @returns {Promise<LogMessage>} The data of the retrieved log
     */
    async getLog(logId: string, day: string, type: string): Promise<LogMessage> {
        /* Send the data to the repository layer to retrieve the log data */
        return this._logRepository.getLog(logId, day, type);
    }

    /**
     * 
     * @param {string} day The day when the log was created
     * @param {string} type The type of the log
     * @param {number} limit The number of logs to retrieve
     * @param {string | undefined} startAfter The ID of the last retrieved log at the previous fetching
     * @returns {Promise<LogMessage[]>} The list of retrieved logs 
     */
    async getLogs(day: string, type: string, limit: number, startAfter?: string): Promise<LogMessage[]> {
        /* Send the data to the repository layer to retrieve the list of logs */
        return this._logRepository.getLogs(day, type, limit, startAfter);
    }

    /**
     * 
     * @param {string} logId The ID of the log to update
     * @param {string} day The day when the log was created
     * @param {string} type The type of log
     * @param {LogMessage} log  The new log data
     * @returns {Promise<LogMessage>} The updated log data
     */
    async updateLog(logId: string, day: string, type: string, log: LogMessage): Promise<LogMessage> {
        /* Send the data to the repository layer to update the log */
        return this._logRepository.updateLog(logId, day, type, log);
    }

    /**
     * 
     * @param {string} logId The ID of the log to delete
     * @param {string} day The day when the log was created
     * @param {string} type The type of log
     * @returns {Promise<string>} "OK" if the log was deleted
     */
    async deleteLog(logId: string, day: string, type: string): Promise<string> {
        /* Send the data to the repository layer to delete the log */
        return this._logRepository.deleteLog(logId, day, type);
    }

    /**
     * 
     * @returns {string} The current day in the format mm-dd-yyyy
     */
    getCurrentDate(): string {
        const dateObj = new Date();
        const day = dateObj.getUTCDate();
        const month = dateObj.getUTCMonth();
        const year = dateObj.getUTCFullYear();

        return `${month}-${day}-${year}`;
    }
}
