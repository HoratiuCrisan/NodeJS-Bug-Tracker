import { TicketRepository } from "../repository/ticketRepository";
import { RedisService } from "./redisService";
import { Ticket, TicketCard} from "../types/Tickets";
import { v4 } from "uuid";
import crypto from "crypto";
import { AppError, User } from "@bug-tracker/usermiddleware";
import { 
    createNotificationMessage, 
    NotificationProducer, 
    NotificationMessage 
} from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/notification-lib/src";
import {UserProducer} from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/user-lib/src";

/* The Ticket Service class: 
    Encapsulates the business logic: 
        like error handling and permission checking;
    Calls the Ticket Repository methods;
*/
export class TicketService {
    private _ticketRepository: TicketRepository;
    private _redisService: RedisService;

    /* Create an instance of the TicketRepository class */
    constructor() {
        this._ticketRepository = new TicketRepository();
        this._redisService = new RedisService();
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} title The title of the ticket
     * @param {string} description The description of the ticket
     * @param {string} priority The priority of the ticket
     * @param {string} type The type of ticket
     * @param {number} deadline The deadline of the ticket
     * @returns {Promise<Ticket>} The created ticket document
     */
    async createTicket(
        userId: string, 
        title: string, 
        description: string, 
        priority: string, 
        type: string, 
        deadline: string
    ): Promise<Ticket> {
        /* Create a new ticket object with the received data */
        const ticket: Ticket = {
            id: v4(),
            authorId: userId,
            handlerId: null,
            title,
            description,
            priority,
            type,
            status: "new",
            response: null,
            createdAt: Date.now(),
            closedAt: null,
            deadline: new Date(deadline).getTime(),
            files: [],
            notified: false,
        };

        /* Send the data to the repository layer to create the ticket */
        const createdTicket = await this._ticketRepository.createTicket(ticket);

        /* Cache the ticket for the user */
        await this._redisService.cacheTicket(userId, ticket);

        /* Return the ticket data */
        return createdTicket;
    }

    /* Only admins have permission to fetch all the tickets */
    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {number} limit The number of tickets to retrieve
     * @param {string} orderBy The criteria to order tickets by
     * @param {string} orderDirection The direction of the ordering
     * @param {string | undefined} searchQuery The query searched by the user
     * @param {string | undefined} status The status of the ticket
     * @param {string | undefined} priority The priority of the ticket
     * @param {string | undefined} startAfter The last ticket ID that was fetched 
     * @returns {Promise<Ticket[]>} The collection of all the tickets
     */
    async getAllTickets(
        userId: string,
        limit: number, 
        orderBy: string,
        orderDirection: string, 
        searchQuery?: string,
        status?: string,
        priority?: string,
        startAfter?: string,
    ): Promise<Ticket[]> {
        /* Generate a hash key for the request query */
        const redisKey = this.generateQueryHashKey(
            userId,
            limit, 
            orderBy, 
            orderDirection, 
            searchQuery,
            status, 
            priority, 
            startAfter
        );

        /* Check if the key was previously cached */
        const cached = await this.getCachedTickets(redisKey);

        if (cached) {
            return cached;
        }

        /* If the key was not cached, send the data to the repository layer to retrieve the tickets list from the data base */
        const tickets = await this._ticketRepository.getAllTickets(limit, orderBy, orderDirection, searchQuery, status, priority, startAfter);

        /* Get the IDs of the tickets */
        const ticketIds: string[] = tickets.map((ticket) => ticket.id); 

        /* Cache the query key */
        await this._redisService.cacheQuery(redisKey, ticketIds);

        /* Return the tickets list */
        return tickets;
    }

    /**
     * 
     * @param {string} userId The ID of the user to retrieve tickets for
     * @param {number} limit The number of tickets returned at a time
     * @param {string} orderBy The field to sort by
     * @param {"asc" | "desc"} orderDirection The order direction
     * @param {string | undefined} searchQuery The query searched by the user 
     * @param {string | undefined} status The status of the ticket
     * @param {string | undefined} priority The priority of the ticket
     * @param {string | undefined} startAfter The last ticket fetched berfore the current request
     * @returns {Promise<Ticket[]>} The collection of the tickets for a specific user
     */
    async getUserTickets(
        userId: string,
        limit: number, 
        orderBy: string, 
        orderDirection: string, 
        searchQuery?: string,
        status?: string,
        priority?: string,
        startAfter?: string,
    ): Promise<Ticket[]> {
        if (orderDirection != "asc" && orderDirection != "desc") {
            throw new AppError(`InvalidOrderDirection`, 400, `Invalid order direction`);
        }

        /* Generate the hashed query key */
        const redisKey = this.generateQueryHashKey(
            userId,
            limit, 
            orderBy, 
            orderDirection, 
            searchQuery,
            status, 
            priority, 
            startAfter
        );

        /* Check if the key is cached */
        const cached = await this.getCachedTickets(redisKey);

        /* If the query key is cached return the cahced tickets list */
        if (cached) {
            return cached;
        }

        /* If the key is not cached send the data to the repository layer to retrieve the user tickets */
        const tickets = await this._ticketRepository.getUserTickets(userId, limit, orderBy, orderDirection, searchQuery, status, priority, startAfter);

        /* Get the ticket IDs */
        const ticketIds = tickets.map((ticket) => ticket.id);

        /* Cache the query key */
        await this._redisService.cacheQuery(redisKey, ticketIds);


        /* Return the tickets list */
        return tickets;
    }

    /**
     * 
     * @param {string} userId The user that is either the author or the handler of the ticket  
     * @param {string} ticketId The ID of the ticket
     * @param {string} role The role of the user
     * @returns {Promise<Ticket>} The data and the ID of a specific ticket 
     */
    async getUserTicketById(
        userId: string, 
        ticketId: string, 
        role: string
    ): Promise<Ticket> {
        /* Check if the ticket is cached for the user */
        const cached = await this._redisService.isTicketCached(ticketId);

        /* If the ticket is cached return the cached ticket data */
        if (cached) {
            return cached;
        }

        /* If the ticket is not cached send the data to the service layer to retrieved the ticket */
        const ticket: Ticket = await this._ticketRepository.getUserTicketById(ticketId);

        /* Check if the user has permission to access the ticket data */
        this.checkUserPermission(userId, role, ticket);

        /* Cache the ticket for the user */
        await this._redisService.cacheTicket(ticketId, ticket);
        
        /* Return the retrieved ticket data */
        return ticket; 
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} role The role of the user that sent the request
     * @param {Ticket} data The new ticket data
     * @returns {Promise<Ticket>} The updated ticket data
     */
    async updateTicketById(
        userId: string,
        ticketId: string,
        role: string,
        data: Ticket
    ) : Promise<Ticket> {
        /* Check if the ticket is locked */
        const isLocked = await this._redisService.isTicketLocked(ticketId);

        /* If the ticket is locked by another user, deny the update */
        if (isLocked && !this.isLockedByUser(userId, isLocked)) {
            throw new AppError(`TicketIsLocked`, 400, `Failed to update ticket. Another user is working on the ticket`);
        }

        /* Lock the ticket */
        if (!isLocked) {
            await this._redisService.lockTicket(userId, ticketId);
        }

        /* Check if the user has permission to update the ticket */
        this.checkUserPermission(userId, role, data);

        /* Update the ticket data */
        const ticket = await this._ticketRepository.updateTicketById(ticketId, data);

        /* Cache the ticket */
        await this._redisService.cacheTicket(ticketId, ticket);

        /* Unlock the ticket */
        await this._redisService.unlockTicket(ticketId);

        /* Return the updated ticket data */
        return ticket;
    }

    /**
     * 
     * @param {string} userId  The ID of the user that sent the request 
     * @param {string} handlerId The ID of the new handler of the ticket
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<Ticket>} The updated ticket data 
     */
    async assignTicket(
        userId: string,
        handlerId: string,
        ticketId: string,
    ): Promise<Ticket> {
        /* Check if the ticket is locked */
        const isLocked = await this._redisService.isTicketLocked(ticketId);

        /* If the ticket is locked by another user, deny the update */
        if (isLocked && !this.isLockedByUser(userId, isLocked)) {
            throw new AppError(`TicketIsLocked`, 400, `Failed to update ticket. Another user is working on the ticket`);
        }

        /* Lock the ticekt */
        await this._redisService.lockTicket(userId, ticketId);

        /* Update the ticket */
        const ticket = await this._ticketRepository.assignTicket(ticketId, handlerId);

        /* Cache the ticket */
        await this._redisService.cacheTicket(ticketId, ticket);

        /* Unlock the ticket */
        await this._redisService.unlockTicket(ticketId);

        /* Return the updated data */
        return ticket;
    }

     /**
      * 
      * @param userId The ID of the user that sent the requets 
      * @param ticektId The ID of the ticket 
      * @param role The role of the user
      */
    async deleteTicket(userId: string, ticketId: string, role: string): Promise<string> {
        /* Check if the ticket is locked */
        const isLocked = await this._redisService.isTicketLocked(ticketId);

        /* If the ticket is locked by another user, deny the deletion */
        if (isLocked && !this.isLockedByUser(userId, isLocked)) {
            throw new AppError(`TicketIsLocked`, 400, `Failed to update ticket. Another user is working on the ticket`);
        }

        /* Lock the ticket */
        await this._redisService.lockTicket(userId, ticketId);

        /* Get the ticket data */
        const ticket = await this._ticketRepository.getUserTicketById(ticketId);

        /* Check if the user has the permission to delete the ticket */
        if (ticket.authorId !== userId && role !== "admin") {
            throw new AppError(`UnauthorizedRequest`, 401, `Unauthorized request. Permission denied`);
        }

        /* Delete the ticket */
        const deletedTicket = await this._ticketRepository.deleteTicket(ticketId);

        /* Check if the ticket is cached */
        const cached = await this._redisService.isTicketCached(ticketId);

        /* Check if the ticket is cached */
        if (cached) {
            /* Remove the ticket from the cache */
            await this._redisService.removeTicketFromCache(ticketId);
        }

        /* Unlock the ticket */
        await this._redisService.unlockTicket(ticketId);

        /* Return the success message */
        return deletedTicket;
    }   

    /**
     * 
     * @returns A map of tickets with the message of the hours and minutes left until the deadline
     */
    async checkUpcomingTicketDeadline() {
        const day = 24 * 60 * 60 * 1000;
        const in24h = Date.now() + day;
        const timestamp = Date.now();

        /* Fetch the unfinished tickets up for deadline */
        const tickets: Ticket[] = await this._ticketRepository.checkUpcomingTicketDeadline(in24h, timestamp, day);

        /* Get the handlers of each ticket */
        const handlerIds = this.getTicketHandlerIds(tickets);

        /* Get the users data for each handler ID */
        const users: User[] = await this.getTicketUsersData(handlerIds);

        /* Notify each handler about the due tickets */
        await this.notifyHandlers(users, tickets);
    }

    /**
     * 
     * @param {Ticket[]} tickets The list of tickets
     * @returns {string[]} The list of handler IDs
     */
    getTicketHandlerIds(tickets: Ticket[]): string[] {
        /* Map over the ticket list and return the handler ID */
        const handlers = tickets.map((ticket: Ticket) => ticket.handlerId);

        /* Filter the handler IDs and remove the null elements */
        const filteredHandlers = handlers.filter((handler: string | null) => handler !== null);

        /* Remove the duplicate handlers by converting the list to a set,
            and convert the set back to a list */
        const uniqueHandlers = Array.from(new Set(filteredHandlers));

        return uniqueHandlers;
    }

    /**
     * 
     * @param users 
     * @param tickets 
     * @returns 
     */
    getTicketCards(users: User[], tickets: Ticket[]): TicketCard[] {
        const usersMap = new Map(users.map(user => [user.id, user]));

        const list: TicketCard[] = [];

        tickets.forEach((ticket: Ticket) => {
           const user = usersMap.get(ticket.authorId);
           
           if (!user) return;

            list.push({
                user: {
                    displayName: user.displayName,
                    photoUrl: user.photoUrl,
                },
                ticket: {
                    ...ticket
                }
            });
        });

        return list;
    }

    /**
     * 
     * @param {Ticket[]} tickets The list of tickets
     * @returns {string[]} The list of author IDs
     */
    getTicketAuthorIds(tickets: Ticket[]): string[] {
        /* Map over the ticket list and return the Author ID */
        const authors = tickets.map((ticket: Ticket) => ticket.authorId);

        /* Remove the duplicate authors by converting the list to a set,
            and convert the set back to a list */
        const uniqueAuthors = Array.from(new Set(authors));

        return uniqueAuthors;
    }

    /**
     * 
     * @param {User[]} users The list of users
     * @param {Ticket[]} tickets Teh list of Tickets
     */
    async notifyHandlers(users: User[], tickets: Ticket[]) {
        /* Create a map with the users data */
        const usersMap = new Map(users.map(user => [user.id, user]));

        const notifications: NotificationMessage[] = [];

        /* Map over each ticket */
        tickets.forEach((ticket) => {
            /* If the ticket has no handler skip the ticket */
            if (!ticket.handlerId) return;

            /* Get the user data from the map based on the ticket handler ID */
            const user = usersMap.get(ticket.handlerId);

            /* If the user data is not provided skip the ticket */
            if (!user) return;

            /* Add each notification for each due ticket */
            notifications.push(createNotificationMessage(
                user.id, 
                user.email, 
                `email`, 
                `Ticket "${ticket.title}" is due at ${new Date(ticket.deadline).toLocaleString()}`, 
                ticket
            ));
        });

        /* Send each notification message to the notification producer to notify the users */
        const notificationProducer = new NotificationProducer();
        
        notifications.forEach(async (notification) => {
            await notificationProducer.assertQueue("notifications", notification);
        });
    }

    /**
     *
     *
     * @param {string[]} userIds The list of user IDs 
     * @return {Promise<User[]>} The list of users data 
     */
    async getTicketUsersData(userIds: string[]): Promise<User[]> {
        /* create a new rabbitMq user producer */
        const userProducer = new UserProducer();

        /* Send the IDs to the users queue to retrieve the users data */
        const users = await userProducer.assertUserQueue("users", userIds);

        /* Return the users data list */
        return users;
    }

    /**
     * 
     * @param {number} seconds The number of seconds left until the deadline of the ticket 
     * @returns {string} A message with the hours and minutes left until the deadline
     */
    getTimeLeft(seconds: number): string {
        /* Get the number of days left */
        let days = Math.floor(seconds / (3600*24));

        /* Remove the days from the seconds */
        seconds  -= days*3600*24;

        /* Get the number of hours left */
        let hrs   = Math.floor(seconds / 3600);
        /* Remove the hours from the seconds */
        seconds  -= hrs*3600;

        /* Get the minutes left */
        let mnts = Math.floor(seconds / 60);
        
        return `${hrs} hours, ${mnts} minutes`;
    }


    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} role The role of the user
     * @param {Ticket} ticket The ticket data 
     * @returns {boolean} True if the user has permisssion and an error otherwise
     */
    checkUserPermission(userId: string, role: string, ticket: Ticket) : boolean {
        /* Check if the user is allowed to operate on certain ticket data */

        /* Check if the user is the author of the ticket */
        if (ticket.authorId === userId) {
            return true;
        }

        /* Check if the user is an admin */
        if (role === "admin") {
            return true;
        }

        /* Check if the user is the handler of the ticket */
        if (ticket.handlerId === userId) {
            return true;
        }   

        /* Throw an error to deny the user access */
        throw new AppError(`UnauthorizedRequest`, 401, `Unauthorized request. Permission denied`);
    }

    /**
     * 
     * @param {string} userId The user that sent the request
     * @param {{lockedBy: string, lockedAt: number}} data The locked data
     * @returns {boolean} True if the ticket is locked by the user and false otherwise
     */
    isLockedByUser(userId: string, data: {lockedBy: string, lockedAt: number}): boolean {
        if (userId !== data.lockedBy) return false;

        return true;
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {number} limit The number of tickets to retrieve
     * @param {string} orderBy The tickets order criteria
     * @param {string} orderDirection The direction of the order
     * @param {string | undefined} searchQuery The query searched by the user
     * @param {string | undefined} status The status of the tickets
     * @param {string | undefined} priority The priority of the tickets
     * @param {string | undefined} startAfter The ID of the last retrieved ticket at the previous fetching request
     * @returns {string} The hashed query key
     */
    generateQueryHashKey(
        userId: string,
        limit: number,
        orderBy: string,
        orderDirection: string,
        searchQuery?: string,
        status?: string,
        priority?: string,
        startAfter?: string 
    ): string {
        /* Stringify the data */
        const queryString = JSON.stringify({userId, limit, orderBy, orderDirection, searchQuery, status, priority, startAfter});

        /* Encrypt the data into a hash key */
        const hash = crypto.createHash("md5").update(queryString).digest("hex");

        /* Return the redis hash query key */
        return `tickets:${hash}`;
    }

    /**
     * 
     * @param key The query hash key
     * @returns {Promise<Ticket[] | null>} Null if no ticket is cached,
     *  or the list of cached tickets and fetched missing tickets from the cache
     */
    async getCachedTickets(key: string): Promise<Ticket[] | null> {
        /* Check if the query is cached and return the list of cached ticket IDs*/
        const ticketIds = await this._redisService.isQueryCached(key);

        if (!ticketIds) return null;

        /* Get the cached tickets based on the IDs */
        const redisKey = ticketIds.map(id => `ticket:${id}`);
        const cachedTickets: Ticket[] = await this._redisService.cachedTickets(redisKey);
  
        const tickets: Ticket[] = [];
        const missingIds: string[] = [];

        /* Iterate over the list of cached tickets and if a ticket is missing
            add the ID of the ticket to the list, otherwise add the ticket 
            to the tickets list */
        for (let i = 0; i < ticketIds.length; i++) {
            const ticketData = cachedTickets[i];
            if (ticketData) {
                tickets.push(ticketData);
            } else {
                missingIds.push(ticketIds[i]);
            }
        }

        /* If there are no missing tickets return the tickets list */
        if (missingIds.length === 0) return tickets;

        const fetchedTickets: Ticket[] = await this._ticketRepository.getTickets(missingIds);

        /* Cache every missing ticket */
        for (const ticket of fetchedTickets) {
            await this._redisService.cacheTicket(ticket.id, ticket);
        }

        /* Combine the tickets from the cache and the tickets from the database into a map */
        const ticketMap = new Map<string, Ticket>();
        [...tickets, ...fetchedTickets].forEach((ticket) => {
            ticketMap.set(ticket.id, ticket);
        });

        /* Order the ticekts based on the request order */
        const orderedTickets = ticketIds.map(id => ticketMap.get(id)).filter((ticket): ticket is Ticket => Boolean(ticket)); 

        /* Return the ticekts list */
        return orderedTickets;
    }

}