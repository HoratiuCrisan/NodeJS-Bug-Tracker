import { TicketObject } from "#/utils/interfaces/Ticket";
import { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from "redis";
import { executeWithHandling } from "#/utils/throwError";
import env from "dotenv";
const redis = require("redis");

export class RedisRepository {
    private _client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

    constructor() {
        /* Create a new redis client */
        this._client = redis.createClient({
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
     * @param {string} username - The user that will locked the ticket to perform operations on it
     * @param {string} ticketId - The ticket will be locked
     * @param {number} timeout  - The time that the ticket will be locked
     * @returns {Promise<boolean>} - True if the ticket was locked, and false otherwise
     */
    async lockTicket(username: string, ticketId: string, timeout: number): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Create the key for each locked ticket */
                const key = `locked-ticket:${ticketId}`;
                const lockedAt = new Date();
                
                /* The value of the locked ticket will contain the user who locked it,
                    and the tike it was locked at */
                const value = JSON.stringify({lockedBy: username, lockedAt: lockedAt});

                /* Add the locked ticket to the redis database */
                const result = await this._client.set(key, value, {
                    NX: true, /* Set the key only if it doesnot exist */
                    EX: timeout, /* Set the deletion time in seconds */
                });

                return result === "OK";
            },
            `Failed to lock ticket: ${ticketId}`
         );
    }

    /**
     * 
     * @param {string} ticketId - the ID of the ticket 
     * @returns {Promise<string | null>} - The string value for the ticket ID if true and null otherwise
     */
    async isTicketLocked(ticketId: string): Promise<string| null> {
        return await executeWithHandling(async () => {
                /* Check if the ticket ID was found in the locked category */
                return await this._client.get(`locked-ticket:${ticketId}`);
            },
            `Failed to check if the ticket: ${ticketId} is locked`
        );
    }

    /**
     * 
     * @param {string} ticketId - The ID of the ticket that will be unlocked
     * @returns {Promise<boolean>} - True if the ticket was unlocked and false otherwise
     */
    async unlockTicket(ticketId: string): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Delete the ticket from the locked category in redis */
                const result = await this._client.del(`locked-ticket:${ticketId}`);

                return result > 0;
            },
            `Failed to unlock ticket: ${ticketId}`
        );
    }

    /**
     * 
     * @param {string} ticketId - The ID of the ticket that will be added to the cache inside the redis database
     * @param {TicketObject} ticket - The ticket data that will be cached
     * @param {number} timeout - The amount of time the ticket will be kept in the cache memory 
     * @returns {Promise<boolean>} - True if the ticket was cached and false otherwise
     */
    async cacheTicket(ticket: TicketObject, ticketId: string, timeout: number): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Set the key of the cached ticket */
                const ticketKey = `cached-ticket:${ticketId}`;

                /* Add the ticket to the redis cache */
                const response = await this._client.set(ticketKey, JSON.stringify(ticket), {
                    /* Set the key even if it already exists */
                    EX: timeout, /* Set the deletion time in seconds */
                });

                return response === "OK";
            },
            `Failed to cache the data for the ticket: ${ticketId}`
        );
    }

    /**
     * 
     * @param {string} ticketId - The ticket that will be checked for being cached
     * @returns {Promise<string | null>} - The stringified ticket data if found, and null otherwise
     */
    async isTicketCached(ticketId: string): Promise<string | null> {
        return await executeWithHandling(
            async () => {
                /* Check if the ticket is stored in the cache memory */
                return await this._client.get(`cached-ticket:${ticketId}`);
            },
            `Failed to check if the ticket: ${ticketId} is in cache`
        );
    }

    /**
     * 
     * @param {string} ticketId - The ticket ID that the updated will be performed on
     * @param {TicketObject} ticket - The ticket data that will be updated
     * @returns {Promise<boolean>} - True if the data was updated and false otherwise
     */
    async updateCachedTicket(ticketId: string, ticket: TicketObject): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Update the data for the cached ticket */
                const response = await this._client.set(ticketId, JSON.stringify(ticket));

                return response === "OK";
            },
            `Failed to update the cached data for the ticket: ${ticketId}`
        );
    }

    /**
     * 
     * @param ticketId - Deletion performed based on the ID of the ticket
     * @returns {Promise<boolean>} - True if the value is greater than 0 and false otherwise
     */
    async removeTicketFromCache(ticketId: string): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Remove the ticket from the cache memory from the redis database */
                const response: number = await this._client.del(ticketId);

                return response > 0;
            },
            `Failed to remove the cached data for the ticket: ${ticketId}`
        );
    }
}