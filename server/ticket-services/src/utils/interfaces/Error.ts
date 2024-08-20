import { Request } from "express";

export default interface CustomRequest extends Request {
    errorMessage?: string;
    errorStatus?: number;
}