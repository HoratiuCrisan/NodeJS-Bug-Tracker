import { TicketRepository } from "#/repository/ticketRepository";
import { RabbitMqRepository } from "#/repository/rabbitMqRepository";
import { Ticket, TicketObject } from "#/utils/interfaces/Ticket";
import { executeWithHandling } from "#/utils/throwError"


/* The Ticket Service class: 
    Encapsulates the business logic: 
        like error handling and permission checking;
    Calls the Ticket Repository methods;
*/
export class TicketService {
    private _ticketRepository: TicketRepository;
    private _rabbitMqRepository: RabbitMqRepository;

    /* Create an instance of the TicketRepository class */
    constructor() {
        this._ticketRepository = new TicketRepository();
        this._rabbitMqRepository = new RabbitMqRepository();
    }

    /**
     * 
     * @param {Ticket} ticketData The ticket data received from the user to create a ticket with
     * @returns {Promise<TicketObject>} The ticket data and its id if the ticket was created
     */
    async createTicket(ticketData: Ticket): Promise<TicketObject> {
        /* Validate the ticket data received as a parameter */
        this.validateTicketData(ticketData);

        /* Try to create a new ticket by passing the ticket data to the Ticket Repository
        function that adds the data to the database */
        return await executeWithHandling(
            () => this._ticketRepository.createTicket(ticketData)
        );
    }

    /* Only admins have permission to fetch all the tickets */
    /**
     * 
     * @param {number} limit The number of tickets fetched at a time
     * @param {string} orderBy The field to sort by
     * @param {"asc" | "desc"} orderDirection The direction of the ordering
     * @param {string | undefined} status The status of the ticket
     * @param {string | undefined} priority The priority of the ticket
     * @param {string | undefined} startAfter The last ticket ID that was fetched 
     * @returns {Promise<TicketObject[]>} The collection of all the tickets
     */
    async getAllTickets(
        limit: number, 
        orderBy: "Title" | "CreatedAt" | "Deadline" | "Type" | "Priority" | "Status",
        orderDirection: "asc" | "desc", 
        status?: string,
        priority?: string,
        startAfter?: string,
    ): Promise<TicketObject[]> {
        /* Get all tickets by calling the Ticket Repository function that fetches the 
            tickets from the database */
        return await executeWithHandling(() => this._ticketRepository.getAllTickets(
            limit, 
            orderBy, 
            orderDirection, 
            status, 
            priority, 
            startAfter
        ));
    }

    /**
     * 
     * @param {string} username The user that is the author or the handler of the ticket
     * @param {number} limit The number of tickets returned at a time
     * @param {string} orderBy The field to sort by
     * @param {"asc" | "desc"} orderDirection The order direction
     * @param {string} status The status of the ticket
     * @param {string} priority The priority of the ticket
     * @param {string} startAfter The last ticket fetched berfore the current request
     * @returns {Promise<TicketObject[]>} The collection of the tickets for a specific user
     */
    async getUserTickets(
        username: string, 
        limit: number, 
        orderBy: "Title" | "CreatedAt" | "Deadline" | "Type" | "Priority" | "Status", 
        orderDirection: "asc" | "desc", 
        status?: string,
        priority?: string,
        startAfter?: string,
    ): Promise<TicketObject[]> {
        /* Get the collection of tickets for a specific user,
            by calling the getUserTickets method from the TicketRepository class */
        return await executeWithHandling(() => 
            this._ticketRepository.getUserTickets(username, limit, orderBy, orderDirection, status, priority, startAfter)
        );
    }

    /**
     * 
     * @param {string} username The user that is either the author or the handler of the ticket  
     * @param {string} ticketId The ID of the ticket
     * @param {string} role The role of the user
     * @returns {Promise<TicketObject>} The data and the ID of a specific ticket 
     */
    async getUserTicketById(
        username: string, 
        ticketId: string, 
        role: string
    ): Promise<TicketObject> {
        return await executeWithHandling(async () => {
            /* Get the ticket data by calling the getUserTicektById method
            from the TicketRepository class */
            const ticket: TicketObject = await this._ticketRepository.getUserTicketById(ticketId);
            
            /* Check if the user is either:
                - the author of the ticket
                - the handler of the ticket
                - an admin 
                in order to have access to the ticket data */ 
            this.checkUserPermission(ticket.data, username, role);
            this.validateTicketData(ticket.data);
            
            return ticket;
        });   
    }

    /**
     * 
     * @param {Ticket} updateTicket The data of the ticket
     * @param {string} username The user that wants to perform the updating operation
     * @param {string} ticketId The ID of the ticket 
     * @param {string} role The role of the user
     * @returns {Promise<TicketObject> } The updated ticket data
     */
    async updateTicketById(
        updateTicket: Ticket, 
        username: string, 
        ticketId: string, 
        role: string
    ) : Promise<TicketObject> {
        return await executeWithHandling(async () => {
            /* Check if the ticket with the specified ID exists */
            const ticketExists: TicketObject = await this._ticketRepository.getUserTicketById(ticketId);

            /* Throw an error if the user is not authorized to update the ticket data */
            this.checkUserPermission(ticketExists.data, username, role);
    
            /* Check if the ticket was updated */
            await this._ticketRepository.updateTicketById(updateTicket, ticketId);
    
            /* Fetch the ticket with the updated data;
                If the ticket could not be fetched,
                a specific error */
            const updatedTicket: TicketObject = await this._ticketRepository.getUserTicketById(ticketId);
    
            /* Return the updated ticket */
            return updatedTicket;
        });
    }

    /**
     * 
     * @param {string} handler The user that the ticket will be assigned to
     * @param {string} handlerId The ID of the handler
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<TicketObject>} The updated ticket data
     */
    async assignTicket(
        handler: string, 
        handlerId: string, 
        ticketId: string
    ): Promise<TicketObject> {
        /* Only the userts with the ADMIN role can assign tickets */
        return await executeWithHandling(async () => {
            /* Check if the ticket exists */
            await this._ticketRepository.getUserTicketById(ticketId);

            /* Assign ticekt handler and handlerId */
            await this._ticketRepository.assignTicket(handler, handlerId, ticketId);

            /* Get the ticket with the updated values */
            const updatedTicket: TicketObject = await this._ticketRepository.getUserTicketById(ticketId);

            return updatedTicket;
        });
    }

    /**
     * 
     * @param {string} username The user that wants to perform the deletion process
     * @param {string} ticketId The ID of the ticket
     * @param {string} role The role of the user
     * @returns {Promise<boolean>} True if the ticket was deleted and false otherwise
     */
    async deleteTicket(username: string, ticket: TicketObject, ticketId: string, role: string): Promise<boolean> {
        /* Only the author and the users with ADMIN role have permission to delet tickets */ 
        
        return await executeWithHandling(async () => {
            /* Check if the user has permission to delete the ticket */
            this.checkUserPermission(ticket.data, username, role);

            return await this._ticketRepository.deleteTicket(ticketId);
        });
    }   

    /**
     * 
     * @returns A map of tickets with the message of the hours and minutes left until the deadline
     */
    async checkUpcomingTicketDeadline(): Promise<Map<TicketObject, string>> {
        return await executeWithHandling(
            async () => {
                /* Get the current time in milliseconds */
                const currentTime: number = new Date().getTime();

                /* Fetch the unfinished tickets up for deadline */
                const tickets: TicketObject[] = await this._ticketRepository.checkUpcomingTicketDeadline();

                
                const ticketsMap: Map<TicketObject, string> = new Map();

                /* Iterate over each ticket in the collection */
                tickets.forEach((ticket: TicketObject) => {
                    /* Get the seconds left until the deadline of the ticket */
                    const seconds: number = (new Date(ticket.data.Deadline).getTime() - currentTime) / 1000;

                    /* Convert the seconds into hours */
                    const hours: number = Math.floor(seconds / 3600);

                    /* If the deadline is in less than a day, add the ticket to the map
                        with a message containing the time left (in hours and minutes) */
                    if (hours <= 24) {
                        const notificationMsg: string = `Your ticket '${ticket.data.Title}' is due today in ${this.getTimeLeft(seconds)}`;
                        
                        ticketsMap.set(ticket, notificationMsg);
                    }
                });

                return ticketsMap;
            },
            `Failed to check the time left until the deadline for the unfinished tickets`
        );
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
     * @param {Ticket} ticket The data of a ticket 
     * @param {string} username The user that wants to perform an operation
     * @param {string} role The role of the user
     * @param {boolean} isHandler Checks if the user can also be a handler of a ticket
     * @returns {boolean} True if user has permission and throws an error otherwise
     */
    checkUserPermission(ticket: Ticket, username: string, role: string, isHandler?: boolean) : boolean {
        /* Check if the user is allowed to operate on certain ticket data */

        /* Check if the user is the author of the ticket */
        if (ticket.Author === username) {
            return true;
        }

        /* Check if the user is an admin */
        if (role === "admin") {
            return true;
        }

        /* Check if the user is the handler of the ticket */
        if (isHandler && ticket.Handler === username) {
            return true;
        }   

        /* Prevent unauthorized users to perform exclusive operations */
        throw new Error(`Unauthorized user: ${username} with role: ${role}! Permission denied`);
    }

    
    /**
     * 
     * @param ticket The data of the ticket
     */
    validateTicketData(ticket: Ticket): void {
        /* The ticket should be at least 10 characters long */
        if (!ticket.Title || ticket.Title.trim().length === 0 || ticket.Title.length < 10) {
            throw new Error(`The ticket title must be at least 10 (ten) characters long`);
        }

        /* The description should be at least 10 characters long */
        if (!ticket.Description || ticket.Description.trim().length === 0 || ticket.Description.length < 10) {
            throw new Error(`The ticket description must be at least 10 (ten) characters long`);
        }

        /* The ticket satatus should be either new, opened, closed or archived */
        if (!["New", "Opened", "Closed", "Archived"].includes(ticket.Status)) {
            throw new Error(`Invalid ticket status: ${ticket.Status}`);
        }

        /* The priority of the ticket should be either low, medium, high or urgent */
        if (!["Low", "Medium", "High", "Urgent"].includes(ticket.Priority)) {
            throw new Error(`Invalid ticket priority: ${ticket.Priority}`);
        }

        /* The ticket type should be either bug, feature or question */
        if (!["Bug", "Feature", "Question"].includes(ticket.Type)) {
            throw new Error(`Invalid ticket type: ${ticket.Type}`);
        }

        /* Every ticket should have a deadline date set */
        if (ticket.Deadline.length === 0) {
            throw new Error(`Invalid ticket deadline: ${ticket.Deadline}`);
        }

        /* Every ticket should have an author */
        if (ticket.Author.trim().length === 0) {
            throw new Error(`Invalid ticket author: ${ticket.Author}`);
        }

        /* Every ticket should have the profile picture of its author */
        if (ticket.AuthorPicture.length === 0) {
            throw new Error(`Invalid ticket author picture: ${ticket.AuthorPicture}`);
        }

        /* Every ticket should have a creation date */
        if (ticket.CreatedAt.length === 0) {
            throw new Error(`Invalid ticket creation data: ${ticket.CreatedAt}`);
        }
    }

    /**
     * 
     * @param {string} routingKey The filter for the RabbitMq queue 
     * @param {"info" | "audit" | "error"} type The type of message 
     * @param {string} message The message to be sent to the queue 
     * @returns {Promise<boolean>} True if the message was published and false otherwise
     */
    async sendMessageToQueue(
        routingKey: string, 
        message: string, 
    ): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Add the type, the service type and the timestamp to the message */

                /* Publish the message to the connected queues */
                await this._rabbitMqRepository.publishMessage(routingKey, JSON.stringify(message));
                
                setTimeout(() => {}, 1000);
                return true;
            },
        );
    }

    /**
     * 
     * @param {string} username The user that will be notified 
     * @param {TicketObject} ticket The data of the ticket
     * @returns {string[]} The collection of users that will be notified
     */
    getUsersToNotify(username: string, ticket: TicketObject): string[] {
        let users: string[] = [];

        if (username === ticket.data.Author) {
            /* If the user that updated the ticket is the handler, notify the author about the changes */
            users.push(ticket.data.Handler);
        } else if (username === ticket.data.Handler) {
             /* If the user that updated the ticket is the author, notify the handler about the changes */
            users.push(ticket.data.Author);
        } else {
            /* If an admin updated the ticket, notify both the author and the handler about the changes */
            users.push(ticket.data.Author, ticket.data.Handler);
        }

        return users;
    }

    /**
     * 
     * @param {string[]} users The collection of users to be notified
     * @param {"info" | "audit" | "error"} type The type of message sent 
     * @param {string} message The stringified message that will be sent
     * @returns {Promise<boolean>} True if the message was sent and false otherwise
     */
    async notifyUsers(users: string[], type: "info" | "audit" | "error", message: string): Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* Add the type, the service type and the timestamp to the message */
                const notifyMessage = {
                    type,
                    details: {
                        service: "ticket-service",
                        timestamp: new Date().toUTCString(),
                        message: message,
                    },
                };
                
                /* Send the notification message to the users */
                await this._rabbitMqRepository.sendNotification(users, type, notifyMessage);
    
                setTimeout(() => {}, 1000);
                return true;
            },
        )
    }

}