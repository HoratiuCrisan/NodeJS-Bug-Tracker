import fs from "fs";
import path from "path";

/* Access the log and error files from the logs directory */
const logFilePath = path.join("./logs", 'node.audit.log');
const errorFilePath = path.join("./logs", 'node.error.log');

/* Get the current moment to add to the log */
function getTimeStamp() {
    return new Date().toISOString();
}

export class Logger {
    /* Create a log steam for the audit messages */
    private logStream = fs.createWriteStream(logFilePath, {flags: 'a'});

    /* Create an error log for the error messages */
    private errorStream = fs.createWriteStream(errorFilePath, {flags: 'a'});

    /* Log the audit messages in the log file */
    log(...args: unknown[]): void {
        const message = `[${getTimeStamp()}] LOG: ${args.join(" ")}\n`;
        this.logStream.write(message);
    }

    /* Log the error messages in the error file */
    error(...args: unknown[]): void {
        const message = `[${getTimeStamp()}] ERROR: ${args.join(" ")}\n`;
        this.errorStream.write(message);
    }

    /* Stop the log and error steams */
    close(): void {
        this.logStream.end();
        this.errorStream.end();
    }
}
