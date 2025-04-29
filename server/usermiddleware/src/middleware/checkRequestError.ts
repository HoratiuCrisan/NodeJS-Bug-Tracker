import { Response, NextFunction, RequestHandler } from "express";
import {CustomRequest} from "../utils/customRequest";

/**
 * 
* @param {CustomRequest} req - The incoming request object, extended with custom error properties.
 * @param {Response} res - The outgoing response object used to send the error response.
 * @param {NextFunction} next - Callback to pass control to the next middleware.
 * @returns {void} Sends an HTTP error response if an error is found; otherwise, continues to the next middleware.
 */
export const checkRequestError: RequestHandler = (req: CustomRequest, res: Response, next: NextFunction): void => {
    /* If an error status and message exist on the request object, respond with the error */
    if (req.errorStatus && req.errorMessage) {
        res.status(req.errorStatus).send(req.errorMessage);
    }

    /* If no errors are found, pass control to the next middleware or route handler */
    next();
};