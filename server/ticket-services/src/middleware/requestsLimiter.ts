import { Request, Response, NextFunction } from "express";

/* Store the request metadata */
/* The key is a string formed of 
    the IP address of the user
    the HTTP request method
    and the route of the request */
const accessCounts = new Map<string, { count: number, timestamp: number }>();

/**
 * 
 * @param {Request} req The HTTP request should have:
 *  @userIp The IP address of the user
 * '@method' The method requested
 *  @route The route to the request  
 * @param {Response} res The server response to the request 
 * @param {NextFunction} next Moves to the next request 
 * @returns {Response | void} A server error message if the limit was exceeded
 *  and nothing otherwise 
 */
export function limitAccess(req: Request, res: Response, next: NextFunction) : Response | void {
    /* Get the IP address */
    const userIp = req.ip; 

    /* Get the request method */
    const method = req.method;

    /* Get the method route */
    const route = req.originalUrl;

    /* Combine the data into a string key */
    const key = `${userIp}-${method}-${route}`;

    /* If the key does not exist in the map,
        add a new entry to the map with the current time */
    if (!accessCounts.has(key)) {
        accessCounts.set(key, {
            count: 1,
            timestamp: Date.now()
        });
    /* Get the data from the entry key*/
    } else {
        const accessData = accessCounts.get(key);
        const currentTime = Date.now();

        /* If the data is undefined (unexpected scenario), the function exits early */
        if (!accessData) 
            return

        /* If the 60s timeout elapsed reset the counter */
        if (currentTime - accessData.timestamp > 60000) { // 60 seconds
            accessCounts.set(key, {
                count: 1,
                timestamp: currentTime
            });
        } else {
            /* If the user performed more than 20 requests 
                in the past minute time out the user */ 
            if (accessData.count >= 20) {
                return res.status(429).json({ error: 'Too many requests. Try again later.' });
            } else {
                /* Otherwise increment the counter for the requests */
                accessCounts.set(key, {
                    count: accessData.count + 1,
                    timestamp: accessData.timestamp
                });
            }
        }
    }

    /* Move to the next request */
    next();
}
