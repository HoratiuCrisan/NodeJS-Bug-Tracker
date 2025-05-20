import { Ticket } from "../types/Tickets";
import { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from "redis";
import { AppError, executeWithHandling } from "@bug-tracker/usermiddleware";
import env from "dotenv";
import {createClient} from "redis";
env.config();

export class RedisRepository {
    private _client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

    constructor() {
        /* Create a new redis client */
        this._client = createClient({
            url: process.env.REDIS_URL, /* Get the url from local env */
        });

        /* Log an error if the client was not created */
        this._client.on('error', (err: Error) => {
            throw new Error(`Failed to connect to the redis server: ${err}`);
        })

        /* Connect the client to the redis server */
        this._client.connect();
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} ticketId The ID of the ticket
     * @param {number} time The time the ticket will be locked for
     * @returns {Promsie<boolean>} True if the ticket was locked
     */
    async lockTicket(userId: string, ticketId: string, time: number): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Create the key for each locked ticket */
                const key = `locked-ticket:${ticketId}`;
                const lockedAt = new Date();
                
                /* The value of the locked ticket will contain the ID of the user who locked it,
                    and the time it was locked at */
                const value = JSON.stringify({lockedBy: userId, lockedAt: lockedAt});

                /* Add the locked ticket to the redis database */
                const result = await this._client.set(key, value, {
                    NX: true, /* Set the key only if it doesnot exist */
                    EX: time, /* Set the deletion time in seconds */
                });

                return result === "OK";
            },
            `LockTicketError`,
            500,
            `Failed to lock the ticket`
         );
    }

    /**
     * 
     * @param {string} ticketId the ID of the ticket 
     * @returns {Promise<{lockedBy: string, lockedAt: number} | null>} The locked data if the ticket is locked or null otherwise
     */
    async isTicketLocked(ticketId: string): Promise<{lockedBy: string, lockedAt: number}| null> {
        return await executeWithHandling(async () => {
            /* Check if the ticket is locked */    
            const locked = await this._client.get(`locked-ticket:${ticketId}`);

            /* If the ticket is not locked return null */
            if (!locked) {
                return null;
            }

            /* Return the locked data of the ticket */
            return JSON.parse(locked);
        },
        `CheckLockedTicketError`,
        500,
        `Failed to check if the ticket is locked`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<boolean>} True if the ticket was unlocked and false otherwise
     */
    async unlockTicket(ticketId: string): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Delete the ticket from the locked category in redis */
                const result = await this._client.del(`locked-ticket:${ticketId}`);

                return result > 0;
            },
            `UnlockTicketError`,
            500,
            `Failed to unlock the ticket`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @param {Ticket} ticket The ticket data 
     * @param {number} time The amount of time the ticket will be kept in the cache memory 
     * @returns {Promise<boolean>} True if the ticket was cached
     */
    async cacheTicket(ticketId: string, ticket: Ticket, time: number): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Set the key of the cached ticket */
                const ticketKey = `ticket:${ticketId}`;

                /* Add the ticket to the redis cache */
                const result = await this._client.set(ticketKey, JSON.stringify(ticket), {
                    /* Set the key even if it already exists */
                    EX: time, /* Set the deletion time in seconds */
                });

                if (!result) {
                    throw new AppError(`CreateCacheTicketError`, 400, `Failed to cache ticket`);
                }

                return result === "OK";
            },
            `CacheTicketError`,
            500,
            `Failed to cache ticket data`
        );
    }

    /**
     * 
     * @param {string[]} keys The ticket keys
     * @returns {Promise<Ticket[]>} The list of cached tickets based on the keys
     */
    async cachedTickets(keys: string[]): Promise<Ticket[]> {
        return executeWithHandling(
            async () => {
                console.log("keys: ", keys);
                /* Get the cached tickets based on the keys */
                const cached = await this._client.mGet(keys);

                const tickets: Ticket[] = [];

                /* Parse eacch element and add it to the list */
                cached.forEach(elemnt => {
                    if (elemnt) {
                        tickets.push(JSON.parse(elemnt) as Ticket);
                    }
                });

                /* Return the tickets list */
                return tickets;
            },
            `RetrievedCahedTicketsByKeyError`,
            500,
            `Failed to retrieved cached tickets for the redis key`
        );
    }

    /**
     * 
     * @param {string} key The hashed query key 
     * @param {Ticket[]} tickets The list of tickets to cache
     * @param {number} time The amount of seconds the query is cached
     * @returns {Promise<string>} The hashed query key
     */
    async cacheQuery(key: string, tickets: string[], time: number): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Save the tickets list with the hash key */
                await this._client.set(key, JSON.stringify(tickets), {EX: time});

                /* Return the key */
                return key;
            },
            `CacheQueryError`,
            500,
            `Failed to cache query`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<Ticket | null>} The ticket data if the ticket is cached and null otherwise
     */
    async isTicketCached( ticketId: string): Promise<Ticket | null> {
        return await executeWithHandling(
            async () => {
                /* Check if the ticket is cached */
                const cached = await this._client.get(`ticket:${ticketId}`);

                /* If the ticket is not cached return null */
                if (!cached) {
                    return null;
                }

                /* Return the ticket data */
                return JSON.parse(cached) as Ticket;
            },
            `IsTicketCached`,
            500,
            `Failed to check if the ticket is cached`
        )
    }

    /**
     * 
     * @param {string} key The query hash key 
     * @returns {Promise<boolean>} True if the key is stored into redis and false otherwise
     */
    async isQueryCached(key: string): Promise<string[] | null> {
        return executeWithHandling(
            async () => {
                /* Check if the query is cached in the redis database */
                const cached = await this._client.get(key);

                /* If the key was not found return null */
                if (!cached) return null;

                /* Return the tickets list */
                return JSON.parse(cached);
            },
            `IsCachedQueryError`,
            500,
            `Failed to check if query is cached`
        )
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @param {Ticket} ticket The updated ticket data
     * @returns {Promise<boolean>} True if the data was updated and false otherwise
     */
    async updateCachedTicket(ticketId: string, ticket: Ticket): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Update the data for the cached ticket */
                const cached = await this._client.set(ticketId, JSON.stringify(ticket));

                return cached === "OK";
            },
            `UpdateCachedTicketError`,
            500,
            `Failed to update the cached ticket data`
        );
    }

    /**
     * 
     * @param ticketId The ID of the ticket to remove
     * @returns {Promise<boolean>} True if the ticket was removed and false otherwise
     */
    async removeTicketFromCache(ticketId: string): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Remove the ticket from the cache memory from the redis database */
                const response: number = await this._client.del(ticketId);

                return response > 0;
            },
            `RemoveTicketFromCacheError`,
            500,
            `Failed to remove from the cache memory`
        );
    }
}