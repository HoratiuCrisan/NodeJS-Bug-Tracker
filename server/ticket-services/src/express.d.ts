import {Request} from "express";
import {User} from "./utils/interfaces/User"

declare module "express" {
    export interface Request {
        user?: User;
    }
}