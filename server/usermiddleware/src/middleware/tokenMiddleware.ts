import { Response, NextFunction, RequestHandler } from 'express';
import { FirebaseUser } from '../types/User';
import {CustomRequest} from '../utils/customRequest';

/**
 * 
 * @param {CustomRequest} req - The incoming request object, extended with custom properties.
 * @param {Response} res - The outgoing response object (not used in this function).
 * @param {NextFunction} next - Callback to pass control to the next middleware.
 */
export const verifyToken: RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    /* Get the token from the headers */
    const idToken = req.headers.authorization?.split(`Bearer `)[1];

    /* If no token was provided, return unauthenticated error */
    if (!idToken) { 
        req.errorMessage = "Error! Unauthorized user!";
        req.errorStatus = 401;

        return next();
    }

    try {
        /* Split each item of the token into an array */
        const arrayToken = idToken.split('.');
        
        /* Parse each item from the array */
        const tokenPayload: FirebaseUser = JSON.parse(atob(arrayToken[1]));

        /* Check if the token has expired */
        if (tokenPayload.auth_time >= tokenPayload.exp) {
            req.errorMessage = "Error! Token has expired! Please login again!";
            req.errorStatus = 401;

            return next();
        }
        
        /* Save the data from the token in the user */
        req.user = tokenPayload;
        next();
    } catch (error) {
        console.error("Error! Cannot verify token: " + error);
        req.errorMessage = "Error! Unauthorized user!";
        req.errorStatus = 401;

        return next();
    }
}
