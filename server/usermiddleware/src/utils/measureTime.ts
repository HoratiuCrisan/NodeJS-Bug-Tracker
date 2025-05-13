import { AppError } from "./appError";

/**
 * 
 * @param fn The request method 
 * @param {string} name The name of the method
 * @returns 
 */
export const measureTime = async <T>(fn: () => Promise<T>, name: string = 'Method') => {
    /* Get the timestamp befor the execution of the method */
    const start = process.hrtime();

    try {
        /* Execute the method and extract the result data */
        const result = await fn();

        /* Get the process execution time of the method and convert it into ms */
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationMs = Math.round((seconds * 1000) + (nanoseconds / 1e6));

        /* Return the data and the execution time of the method */
        return {data: result, duration: durationMs};
    } catch (error) {
        /* Measure the execution time of the failed method and convert it to ms */
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationMs = Math.round((seconds * 1000) + (nanoseconds / 1e6));

        throw new AppError(`ExecutionTimeMeasureError`, 500, `"${name}" failed after ${durationMs}ms `);
    }
}