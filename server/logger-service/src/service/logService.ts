import { catchErrorTyped } from "../utils/errorHandler";
import { LogRepository } from "../repository/logRepository";
import { LogMessage } from "../utils/types/Log";

export class LogService {
    private _logRepository: LogRepository;
    private _document: string;

    constructor() {
        this._logRepository = new LogRepository();
        this._document = new Date().toDateString();
    }

    async createLog(data: LogMessage) {
        const [logExistsError, logExists] = await catchErrorTyped(this._logRepository.getLog(this._document));

        if (logExistsError) {
            throw logExistsError;
        }

        if (!logExists) {
            const [createdLogError, createdLog] = await catchErrorTyped(this._logRepository.createLog(this._document, data));

            if (createdLogError) {
                throw new Error(`Failed to create the log "${this._document}": ${createdLogError}`);
            }

            return createdLog;
        }

        const [appendedLogError, appendedLog] = await catchErrorTyped(this._logRepository.appendLog(this._document, data));

        if (appendedLogError) {
            throw new Error(`Failed to append to the log "${this._document}" the message:\n"${data}"\n${appendedLogError}`);
        }

        return appendedLog;
    }
}