import { AppError } from "./appError";

/**
 * 
 * @param {T} action Generic async function that performs an action and returns a promise containing a generic data type 
 * @param {string} name - The name of the error thrown
 * @param {number} httpCode - The http status code thrown
 * @param {string} description - The details about the error thrown
 * @returns {Promise<T>} Returns a promise with a generic data type
 */
export async function executeWithHandling<T>(action: () => Promise<T>, name: string, httpCode: number, description: string): Promise<T> {
    try {
        /* Try to perform an action */
        return await action();
    } catch (error) {
        /* If the error could not be perform throw an error with the error message */
        console.log(error);
        throw new AppError(name, httpCode, description);
    }
}