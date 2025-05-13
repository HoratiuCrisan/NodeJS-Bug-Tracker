import { Request } from "express";
import { FirebaseUser } from "../types/User";

/* Generate a custom request that extends the express request 
    but also contains an error message, status and the user token data */ 
export interface CustomRequest extends Request {
    user?: FirebaseUser;
    errorMessage?: string;
    errorStatus?: number;
}