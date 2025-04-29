export class AppError extends Error {
    public readonly name: string; 
    public readonly httpCode: number;

    /**
     * 
     * @param {string} name - The name of the error encountered 
     * @param {number} httpCode - The HTTP status code of the error 
     * @param {string} description - Human readable error message 
     */
    constructor(name: string, httpCode: number, description: string) {
        super(description);

        this.name = name;
        this.httpCode = httpCode;

        /* Get the error message satack for development */
        Error.captureStackTrace(this, this.constructor);
    }
}