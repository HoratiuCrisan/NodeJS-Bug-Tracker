import { Response, NextFunction, ErrorRequestHandler } from "express";
import {CustomRequest} from "../utils/customRequest";
import { AppError } from "../utils/appError";

/**
 * 
 * @param {AppError} err The AppError object returned by the controller 
 * @param {CustomRequest} req The controller request extended with the Firebase User data
 * @param {Response} res The API request response from the controller 
 * @param {NextFunction} next The function that is called next 
 * @returns 
 */
export const errorHandler: ErrorRequestHandler = (
    err: AppError, 
    req: CustomRequest, 
    res: Response, 
    next: NextFunction
): void => {
    const statusCode = err.httpCode || 500; /* Get the AppError http code or set a default 500 error code */
    const message = err.message || `An unexpected error occurred`; /* Get the AppError error message or set a default error message */
    
    /* Return the error response */
    res.status(statusCode).json({
        success: false,
        name: err.name,
        message,
    });
}