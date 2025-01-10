import {Request} from "express";
import {User} from "./utils/interfaces/User"

/* Extend the Request interface to contain the user data */
declare module "express" {
    export interface Request {
        user?: User;
    }
}