import { Request } from "express";
import { FirebaseUser } from "../types/User";

export interface CustomRequest extends Request {
    user?: FirebaseUser;
    errorMessage?: string;
    errorStatus?: number;
}