import { Response, NextFunction } from "express";
import { LogService } from "../service/logService";
import {CustomRequest} from "@bug-tracker/usermiddleware/src";
import { handleResponseSuccess, validateData } from "@bug-tracker/usermiddleware";
import {
    getLogSchema,
    getLogsSchema,
    updateLogSchema,
    deleteLogSchema,
} from "../schemas/logSchemas";

const logService = new LogService();

export class LogController {
    static async getLog(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    logId: req.params.logId, /* The ID of the Log to retrieve */
                    day: req.params.day, /* The day when the log was emitted */
                    type: req.params.type, /* The type of log */
                },
                getLogSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to retrieve the log */
            const log = await logService.getLog(inputData.logId, inputData.day, inputData.type);

            /* Return the success message with the Log data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Log data retrieved successfully`,
                data: log,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getLogs(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    day: req.params.day, /* The day when the Log was emitted */
                    type: req.params.type, /* The type of Log */
                    limit: Number(req.query.limit), /* Convert the limit of Logs to be retrieved to a number */
                    startAfter: req.query.startAfter, /* Convert the ID of the last retrieved Log to a string */
                },
                getLogsSchema, /* Validate the data based on the schema */
            );

            let startAfter;
            
            if (!inputData.startAfter) {
                startAfter = undefined;
            } else {
                startAfter = String(inputData.startAfter);
            }

            /* Send the data to the service layer to retrieve the list of logs */
            const logs = await logService.getLogs(inputData.day, inputData.type, inputData.limit, startAfter);

            /* Return the success message with the list of Logs */
            res.status(201).json({
                success: true,
                message: `Logs retrieved successfully`,
                data: logs,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateLog(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    logId: req.params.logId, /* The ID of the log to update */
                    day: req.params.day, /* The day when the log was emitted */
                    type: req.params.type, /* The type of log */
                    log: req.body.log, /* The new log data */
                },
                updateLogSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to update the log document */
            const updatedLog = await logService.updateLog(inputData.logId, inputData.day, inputData.type, inputData.log);

            /* Return the success message with the updated log data */
            res.status(201).json({
                success: true,
                message: `Log updated successfully`,
                data: updatedLog,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteLog(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    logId: req.params.logId, /* The ID of the log to delete */
                    day: req.params.day, /* The day when the log was emitted */
                    type: req.params.type, /* The type of log */
                },
                deleteLogSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to delete the log */
            const log = await logService.deleteLog(inputData.logId, inputData.day, inputData.type);

            /* Return the success message */
            res.status(201).json({
                success: true,
                message: `Log deleted successfully`,
                data: log /* OK */
            });
        } catch (error) {
            next(error);
        }
    }
}