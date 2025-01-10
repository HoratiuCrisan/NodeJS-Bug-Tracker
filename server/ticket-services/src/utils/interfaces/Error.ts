import { Request } from "express";

/* Extend the functionality of a request,
    to display the error status and message */
export default interface CustomRequest extends Request {
    errorMessage?: string;
    errorStatus?: number;
}