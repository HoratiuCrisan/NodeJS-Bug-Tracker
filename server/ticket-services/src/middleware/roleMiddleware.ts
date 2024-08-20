import { Request, Response, NextFunction} from "express";
import CustomRequest from "../utils/interfaces/Error"

export const verifyUserRole = (roles: Array<string>) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        const { user } = req;

        console.log("User: ", user);

        if (!user) {
            req.errorMessage = "Error! No user data provided!";
            req.errorStatus = 401;

            return next();
        }

        if (!user.role || !roles.includes(user.role)) {
            req.errorMessage = "Forbidden: Insufficent permissions!";
            req.errorStatus = 403;

            return next();
        }

        next();
    }
}

export const fetchUserRole = (token: string) => {
    
}
