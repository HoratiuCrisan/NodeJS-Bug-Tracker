import { ObjectSchema } from "joi";
import { AppError } from "./appError";

/**
 * 
 * @param {T} data The data to be validated using the schema
 * @param {ObjectSchema} schema The Joi object schema 
 * @returns {T} the validated data 
 */
export const validateData = <T>(data: T, schema: ObjectSchema): T => {
    /* Validate the data using the joi schema */
    const { error, value } = schema.validate(data, {abortEarly: false});

    /* If an error occured during the validation process,
    map over the error details and throw a new app error */
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message);
        throw new AppError(`ValidationError`, 400, errorMessage.join(", "));
    }

    /* Return the validated data */
    return value;
}