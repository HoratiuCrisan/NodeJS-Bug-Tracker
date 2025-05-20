import { RedisRepository } from "../repository/redisRepository";
import { Ticket } from "../types/Tickets";

export class RedisService {
    private _redisTicketRepository: RedisRepository;
    private _defaultTimeout: number;
    private _CACHE_TIME: number;

    constructor() {
        this._redisTicketRepository = new RedisRepository();
        this._defaultTimeout = 15 * 60;
        this._CACHE_TIME = 24 * 60 * 60;
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} ticketId The ID of the ticket 
     * @returns {Promise<boolean>} True if the ticket was locked and false otherwise
     */
    async lockTicket(userId: string, ticketId: string): Promise<boolean> {
        /* Send the data to the repository layer to lock the ticket */
        return await this._redisTicketRepository.lockTicket(userId, ticketId, this._defaultTimeout);
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket 
     * @returns {Promise<string | null>} The value of the locked data if the ticket is locked
     * and null otherwise
     */
    async isTicketLocked(ticketId: string): Promise<{lockedBy: string, lockedAt: number} | null> {
        return await this._redisTicketRepository.isTicketLocked(ticketId);
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket 
     * @returns {Promise<boolean>} True if the ticket was unlocked and false otherwise 
     */
    async unlockTicket(ticketId: string): Promise<boolean> {
        return await this._redisTicketRepository.unlockTicket(ticketId);
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket 
     * @param {Ticket} ticket The data of the ticket 
     * @returns {Promise<boolean>} True if the ticket was cached memory and false otherwise
     */
    async cacheTicket(ticketId: string, ticket: Ticket): Promise<boolean> {
        return await this._redisTicketRepository.cacheTicket(ticketId, ticket, this._CACHE_TIME);
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<Ticket | null>} The ticket data if it is cached or null otherwise
     */
    async isTicketCached(ticketId: string): Promise<Ticket | null> {
        return await this._redisTicketRepository.isTicketCached(ticketId);
    }

    /**
     * 
     * @param {string} key The query hash key 
     * @returns {Promise<Ticket[] | null>} The stored tickets list if the query is stored or null
     */
    async isQueryCached(key: string): Promise<string[] | null> {
        return await this._redisTicketRepository.isQueryCached(key);
    }

    /**
     * 
     * @param {string} key The hashed query key 
     * @param {string[]} ids The list of ticket IDs to cache
     * @returns {Promise<string>} The hashed key
     */
    async cacheQuery(key: string, ids: string[]): Promise<string> {
        return await this._redisTicketRepository.cacheQuery(key, ids, this._CACHE_TIME);
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<boolean>} True if the ticket was removed from the cache and false otherwise
     */
    async removeTicketFromCache(ticketId: string): Promise<boolean> {
        return await this._redisTicketRepository.removeTicketFromCache(ticketId);
    }

    /**
     * 
     * @param {string[]} keys The list of keys of tickets to cache
     * @returns {Promise<Ticket[]>} The list of cached tickets
     */
    async cachedTickets(keys: string[]): Promise<Ticket[]> {
        /* Send the data to the repository layer to cache the list of IDs */
        if (keys.length === 0) return [];

        return await this._redisTicketRepository.cachedTickets(keys);
    }
}