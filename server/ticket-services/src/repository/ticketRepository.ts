import { Ticket, TicketObject } from "#/utils/interfaces/Ticket";
import { executeWithHandling } from "#/utils/throwError";
import admin from "#/config/firebase-config";
const db = admin.firestore();

export class TicketRepository {
    /* Ticket Repository is used to interact with the Firebase database,
    and perform CRUD operations on the tickets */

    /**
     * 
     * @param {Ticket} ticketData The ticket data received to add to the database 
     * @returns {Promise<TicketObject>} The newly created ticket with it's ID
     */
    async createTicket(ticketData: Ticket): Promise<TicketObject> {
        return await executeWithHandling(
            async () => {
                /* Add the ticket to the Tickets collection in the firebase database */
                const response = await db.collection("Tickets").add(ticketData);
                
                /* Get the data from firebase */
                const ticketInfo = await response.get();

                const ticket: TicketObject = {
                    id: ticketInfo.id,
                    data: ticketInfo.data() as Ticket
                }

                return ticket;
            },
            `Failed to create the ticket with the title: ${ticketData.Title}`
        );
    }
    
    /**
     * 
     * @param {number} limit The number of items per page
     * @param {string} orderBy The field to sort by
     * @param {"asc" | "desc"} orderDirection The sorting direction 
     * @returns {Promise<TicketObject[]>} A collection of filtered tickets
     */
    async getAllTickets(
        limit: number, 
        orderBy: "Title" | "CreatedAt" | "Deadline" | "Type" | "Priority" | "Status",
        orderDirection: "asc" | "desc", 
        status?: string,
        priority?: string,
        startAfter?: string,
    ): Promise<TicketObject[]> {
        /* Only admins have access to all the tickets */
        return await executeWithHandling(async () => {            
            /* Get the tickets collection query */
            let ticketsRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = 
                db.collection("Tickets");

            /* If the api call contains a status, filter the Tickets collection
                based on the ticket status that was sent */
            if (status) {
                ticketsRef = ticketsRef.where("Status", "==", status);
            }

            /* If the api call contains a priority type, filter the Tickets collection
                based on the ticket priority that was sent */
            if (priority) {
                ticketsRef = ticketsRef.where("Priority", "==", priority);
            }

            /* Order the tickets colletion by the order criteria and the direction, 
                received from the api call */
            ticketsRef.orderBy(orderBy, orderDirection);

            if (startAfter) {
                /* Check if the ticket with the sent ID exists */
                const lastDocSnapshot = await db.collection("Tickets").doc(startAfter).get();

                /* Mark the starting point from where the fetching will begin
                    for the collection of tickets */
                if (lastDocSnapshot.exists) {
                    ticketsRef = ticketsRef.startAfter(lastDocSnapshot);
                }
            }

            /* Fetch the number of tickets delimited by the limit 
                that was received from the api call for the collection */
            ticketsRef = ticketsRef.limit(limit);

            /* Return only the need ticket information to be displayed on the tickets page */
            const ticketsData = await ticketsRef.select("Ttitle", "AuthorPicture", "Priority", "Status", "Deadline").get();

            const tickets: TicketObject[] = [];

            /* Get the ID and the required data for each ticket fetched */
            ticketsData.docs.map((doc) => {
                tickets.push({
                    id: doc.id,
                    data: doc.data() as Ticket,
                });
            });


            return tickets;
            },
            `Failed to fetch the tickets collection `
        );
    }

    /**
     * 
     * @param {string} username The filtering property for ticket collection
     * @param {number} limit The number of items per page
     * @param {string} orderBy The field to sort by
     * @param {"asc" | "desc"} orderDirection The sorting direction 
     * @returns {Promise<TicketObject[]>} A collection of filtered tickets
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
        /* A user that is NOT an admin should only have access to the tickets:
            ** That he is the author of 
            ** That he is the handler
        */

        /* Get the Tickets Collection query */
        let ticketsRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            db.collection("Tickets");

        /* If the api call contains a status, filter the Tickets collection
            based on the ticket status that was sent */
        if (status) {
            ticketsRef = ticketsRef.where("Status", "==", status);
        }

        /* If the api call contains a priority type, filter the Tickets collection
            based on the ticket priority that was sent */
        if (priority) {
            ticketsRef = ticketsRef.where("Priority", "==", priority);
        }

        /* Query all the tickets where the user is the author of the ticket,
            and not the handler of it */ 
        let queryAuthor = ticketsRef.where("Author", "==", username)
                                    .where("Handler", "!=", username);

        /* Query all the ticekts where the user is the handler of the ticket,
            and not the author of it */
        let queryHandler = ticketsRef.where("Handler", "==", username)
                                    .where("Author", "!=", username);

        /* Order both collections by the order criteria and the direction, 
            received from the api call */ 
        queryAuthor = queryAuthor.orderBy(orderBy, orderDirection);
        queryHandler = queryHandler.orderBy(orderBy, orderDirection);
        
        /* Implementation of the cursor type pagination */
        /* If a ticket ID was sent with the value `startAfter`,
            fetch the tickets that come after it */
        if (startAfter) {
            /* Check if the ticket with the sent ID exists */
            const lastDocSnapshot = await db.collection("Tickets").doc(startAfter).get();

            /* Mark the starting point from where the fetching will begin
                for both collections of tickets */
            if (lastDocSnapshot.exists) {
                queryAuthor = queryAuthor.startAfter(lastDocSnapshot);
                queryHandler = queryHandler.startAfter(lastDocSnapshot);
            }
        }

        /* Fetch the number of tickets delimited by the limit 
            that was received from the api call for both collections */
        queryAuthor = queryAuthor.limit(limit);
        queryHandler = queryHandler.limit(limit);

        try {
            /* Get the tickets collection */
            const ticketsAuthor = await queryAuthor.select("Title", "AuthorPicture", "Priority", "Status", "Deadline").get();
            const ticketsHandler = await queryHandler.select("Title", "AuthorPicture", "Priority", "Status", "Deadline").get();

            /* Add both collections into a new list */
            const allTickets = [
                
                /* For each ticket inside the author collection
                    add the ticket data and the ticket ID */
                ...ticketsAuthor.docs.map((doc) => ({
                    id: doc.id,
                    data: doc.data() as Ticket,
                })),
                
                /* For each ticket inside the handler collection
                    add the ticket data and the ticket ID */
                ...ticketsHandler.docs.map((doc) => ({
                    id: doc.id,
                    data: doc.data() as Ticket,
                })),
            ];

            /* Sort the newly created list based on the direction 
                received from the api call */
            allTickets.sort((a, b) => {
                const aValue = a.data[orderBy];
                const bValue = b.data[orderBy];

                if (orderDirection === "asc") {
                    return aValue > bValue ? 1 : -1;
                } 
                    return aValue < bValue ? 1 : -1;
            });

            /* Slice the list of tickets so it does not return 
                more tickets than it is required */
            const limitedTickets = allTickets.slice(0, limit);

            return limitedTickets;
        } catch (error) {
            /* Log the error that appeared while fetching the ticket collection */
            throw new Error(`Error fetching tickets for the user ${username}: ${error}`);
        }
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<TicketObject>} The specific ticket after filtering based on username and ID
     */
    async getUserTicketById(ticketId: string): Promise<TicketObject> {
        /* A user should have access to  a specific ticket data only if:
            ** The user is the author of the ticket
            ** The user is the handler of the ticket
            ** The user is an admin
        */
        return await executeWithHandling(async () => {
             /* Get the ticket with the ID from the function parameters from the database */
            const tikcetRef = await db.collection("Tickets").doc(ticketId).get();

            /* If the ticket could not be found throw a specific error */
            if (!tikcetRef.exists) {
                throw new Error(`Ticket with the ID ${ticketId} could not be found`);
            }

            /* The values from the ticket will be stored in the new variable */
            let ticket: TicketObject;

            /* Add to the ticket data the id of the ticket and return the new object */
            ticket = {
                id: ticketId,
                data: tikcetRef.data() as Ticket,
            };

            return ticket;
            },
            `Failed to fetch the data of the ticket: ${ticketId}`
        );
    }

    /**
     * 
     * @param {Ticket} updateTicket The new ticket data used for updating the ticket  
     * @param {stirng} ticketId The document from the ticket collection 
     * @returns {Promise<boolean>} True if the ticket data was updated and false otherwise
     */
    async updateTicketById(updateTicket: Ticket, ticketId: string) : Promise<boolean> {
        return await executeWithHandling(
            async () => {
                /* If the ticket status is "Closed" set the ClosedAt value to the current time */
                if (updateTicket.Status === "Closed") {
                    const closedAt = new Date().toString();

                    await db.collection("Tickets").doc(ticketId).update({
                        closedAt,
                        ...updateTicket,
                    });

                    return true;
                }

                /* Update the ticket with the data received from the ticketService object*/
                await db.collection("Tickets").doc(ticketId).update({
                    ...updateTicket, 
                });

                return true;
            },
            `Failed to updated the data of the ticket: ${ticketId}`
        );
    }

    /**
     * 
     * @param {string} handler The user responsible to work on a ticket 
     * @param {string} handlerId The ID of the handler 
     * @param {string} ticketId The document name from the ticket collection 
     * @returns {Promise<boolean>} Returns true if the handler and the handlerId
     * were assigned and false otherwise
     */
    async assignTicket(handler: string, handlerId: string, ticketId: string): Promise<boolean> {
        return await executeWithHandling(
            async() => {
                /* Access a specific ticket from the database collection
                    based on the received ID, and updated its handler and handlerId */
                const ticketRef = db.collection("Tickets").doc(ticketId);
                
                await ticketRef.update({
                    Handler: handler,
                    HandlerId: handlerId,
                });

                /* Return true if the ticket was updated and false otherwise */
                return true;
            },
            `Failed to assign the ticket: ${ticketId} to the user: ${handler}`
        );
    }

    /**
     * 
     * @param {string} ticketId The document name inside the ticket collection 
     * @returns {Promise<boolean>} Returns true if the ticket was deleted and false otherwise
     */
    async deleteTicket(ticketId: string): Promise<boolean> {
        /* Delete the ticket from the database */
        return await executeWithHandling (
            async () => {
                await db.collection("Tickets").doc(ticketId).delete();

                /*If the ticket was deleted return true otherwise false and log the error*/
                return true;
            },
            `Failed to delete the ticket: ${ticketId}`
        );        
    }

    /**
     * 
     * @returns The collection of tickets that are not closed
     */
    async checkUpcomingTicketDeadline(): Promise<TicketObject[]> {
        return await executeWithHandling(
            async () => {
                /* Get the tickets collection query */
                let ticketsRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = 
                    db.collection("Tickets");

                /* Select only the tickets that have a handler, 
                    were not notified already and are not closed */
                ticketsRef = ticketsRef.where("ClosedAt", "==", null)
                    .where("Notified", "==", false)
                    .where("Handler", "!=", "")
                    .where("HandlerId", "!=", "");
                

                /* Fetch only the title, creation date and the deadline */
                const ticketsData = await ticketsRef.select("Title", "CreatedAt", "Deadline").get();

                let tickets: TicketObject[] = [];

                /* Add each ticket with its id to the tickets collection */
                ticketsData.forEach((doc) => {
                    tickets.push({
                        id: doc.id,
                        data: doc.data() as Ticket,
                    });
                });

                return tickets;
            },
            `Failed to fetch tickets for upcoming deadlines`
        )
    }
}