import { ObjectSchema } from "joi";
import { AppError } from "./appError";

export const validateData = <T>(data: T, schema: ObjectSchema): T => {
    const { error, value } = schema.validate(data, {abortEarly: false});

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message);
        throw new AppError(`ValidationError`, 400, errorMessage.join(", "));
    }

    return value;
}