import { Response, NextFunction} from "express";
import {CustomRequest} from "../utils/customRequest";

/**
 * 
 * @param {string[]} roles The possible user roles for performing an operation
 */
export const verifyUserRole = (roles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        /* Get the user data from the request */
        const { user } = req;

        /* If the user data is missing return an unauthorized error */
        if (!user) {
            req.errorMessage = "Error! No user data provided!";
            req.errorStatus = 401;

            return next();
        }

        /* Check if the role of the user is included in the parameter role */
        /* If the role is missing, the user is unathorized to perform the operation,
            return the unauthorized error */
        if (!user.role || !roles.includes(user.role)) {
            req.errorMessage = "Forbidden: Insufficent permissions!";
            req.errorStatus = 403;

            return next();
        }

        next();
    }
}
