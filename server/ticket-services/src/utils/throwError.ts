/**
 * 
 * @param {T} action Generic async function that performs an action and returns a promise containing a generic data type 
 * @param {string} errorMessage Error that will be thrown in the case that the operation could not be performed
 * @returns {Promise<T>} Returns a promise with a generic data type
 */
export async function executeWithHandling<T>(action: () => Promise<T>, errorMessage?: string): Promise<T> {
    try {
        /* Try to perform an action */
        return await action();
    } catch (error) {
        /* If the error could not be perform throw an error with the error message */
        throw new Error(`${errorMessage} ${error}`);
    }
}