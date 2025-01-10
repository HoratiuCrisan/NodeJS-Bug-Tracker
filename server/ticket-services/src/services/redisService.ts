import { RedisRepository } from "#/repository/redisRepository";
import { TicketObject } from "#/utils/interfaces/Ticket";
import { executeWithHandling } from "#/utils/throwError";

export class RedisService {
    private _redisTicketRepository: RedisRepository;
    private _defaultTimeout: number;

    constructor() {
        this._redisTicketRepository = new RedisRepository();
        this._defaultTimeout = 15 * 60;
    }

    /**
     * 
     * @param {string} username The user that wants to lock the ticket 
     * @param {string} ticketId The ID of the ticket 
     * @returns {Promise<boolean>} True if the ticket was locked and false otherwise
     */
    async lockTicket(username: string, ticketId: string): Promise<boolean> {
        return await executeWithHandling(
            /* Lock the ticket in the redis cache */
            async () => await this._redisTicketRepository.lockTicket(username, ticketId, this._defaultTimeout),
            `Failed to lock ticket: ${ticketId}`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket 
     * @returns {Promise<string | null>} The value of the locked data if the ticket is locked
     * and null otherwise
     */
    async isTicketLocked(ticketId: string): Promise<string | null> {
        return await executeWithHandling(
            /* Check if the ticket is locked */
            async () => await this._redisTicketRepository.isTicketLocked(ticketId),
            `Failed to check if ticket: ${ticketId} is locked`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket 
     * @returns {Promise<boolean>} True if the ticket was unlocked and false otherwise 
     */
    async unlockTicket(ticketId: string): Promise<boolean> {
        return await executeWithHandling(
            /* Unlock the ticket by removing it from the redis cache */
            async () => await this._redisTicketRepository.unlockTicket(ticketId),
            `Failed to unlock ticket: ${ticketId}`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket 
     * @param {TicketObject} ticket The data of the ticket 
     * @param {number} timeout The time the ticket will be stored in the cache 
     * @returns {Promise<boolean>} True if the ticket was cached memory and false otherwise
     */
    async cacheTicket(ticketId: string, ticket: TicketObject, timeout: number): Promise<boolean> {
        return await executeWithHandling(
            /* Add the key value pair of the ticketId and ticket data to the cache */
            async () => await this._redisTicketRepository.cacheTicket(ticket, ticketId, timeout),
            `Failed to cache the ticket: ${ticketId}`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket 
     * @returns {Promise<string | null>} The value stored for the ticket ID 
     * if it was found in the cache and null otherwise
     */
    async isTicketCached(ticketId: string): Promise<string | null> {
        return await executeWithHandling(
            /* Check if the ticket is cached in the redis database */
            async () => await this._redisTicketRepository.isTicketCached(ticketId),
            `Failed to check if the ticket: ${ticketId} is cached`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<boolean>} True if the ticket was removed from the cache and false otherwise
     */
    async removeTicketFromCache(ticketId: string): Promise<boolean> {
        return await executeWithHandling(
            /* Remove the ticket from the cache memory */
            async () => this._redisTicketRepository.removeTicketFromCache(ticketId),
            `Failed to remove the ticket: ${ticketId} from cache`
        );
    }
}