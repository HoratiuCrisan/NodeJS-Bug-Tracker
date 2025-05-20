import { Ticket } from "../types/Tickets";
import { AppError, executeWithHandling } from "@bug-tracker/usermiddleware";
import env from "dotenv";
import admin from "../../config/firebase-config";

const db = admin.firestore();
const FieldPath = admin.firestore.FieldPath;
env.config();

export class TicketRepository {
    /* Ticket Repository is used to interact with the Firebase database,
    and perform CRUD operations on the tickets */

    private _dbTicketsCollection: string;

    constructor() {
        if (!process.env.TICKETS_COLLECTION) {
            throw new AppError(`InvalidEnvData`, 400, `Invalid env. data`);
        }

        this._dbTicketsCollection = process.env.TICKETS_COLLECTION;
    }

    /**
     * 
     * @param {Ticket} ticket The ticket data to add to the database
     * @returns {Promise<Ticket>} The newly created ticket
     */
    async createTicket(ticket: Ticket): Promise<Ticket> {
        return await executeWithHandling(
            async () => {
                /* Create a new ticket document */
                const ticketRef = db.collection(this._dbTicketsCollection).doc(ticket.id);
                
                /* Add the data to the document */
                await ticketRef.set(ticket);

                /* Return the created ticket data */
                return (await ticketRef.get()).data() as Ticket;
            },
            `CreateTicketError`,
            500,
            `Failed to create ticket`
        );
    }
    
    /**
     * 
     * @param {number} limit The number of tickets to retrieve 
     * @param {string} orderBy The crieteria to order the tickets by 
     * @param {string} orderDirection The direction of the order
     * @param {string | undefined} searchQuery The searched user query  
     * @param {string | undefined} status The status of the ticket 
     * @param {string | undefined} priority The status of the ticket
     * @param {string | undefined} startAfter The ID of the last retrieved ticket at the previous fetching request
     * @returns {Promise<Ticket[]>} The retrieved tickets list
     */
    async getAllTickets(
        limit: number, 
        orderBy: string,
        orderDirection: string, 
        searchQuery?: string,
        status?: string,
        priority?: string,
        startAfter?: string,
    ): Promise<Ticket[]> {
        return await executeWithHandling(
            async () => {            
                /* Get the tickets collection query */
                let ticketsRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = 
                    db.collection(this._dbTicketsCollection);

                /* If the api call contains a status, filter the Tickets collection
                    based on the ticket status that was sent */
                if (status) {
                    ticketsRef = ticketsRef.where("status", "==", status);
                }

                /* If the api call contains a priority type, filter the Tickets collection
                    based on the ticket priority that was sent */
                if (priority) {
                    ticketsRef = ticketsRef.where("priority", "==", priority);
                }

                /* Order the tickets colletion by the order criteria and the direction, 
                    received from the api call */

                /* Check if the ordering direction is valid */
                if (orderDirection !== "asc" && orderDirection !== "desc") {
                    throw new AppError(`InvalidDirectionOrder`, 400, `Invalid tickets order direction`);
                }

                ticketsRef.orderBy(orderBy, orderDirection);

                if (startAfter) {
                    /* Check if the ticket with the sent ID exists */
                    const lastDocSnapshot = await db.collection(this._dbTicketsCollection).doc(startAfter).get();

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
                const ticketsData = await ticketsRef.select("id", "title", "authorId", "priority", "status", "deadline").get();

                const tickets: Ticket[] = [];

                /* Add the ticket to the list */
                ticketsData.docs.map((doc) => {
                    tickets.push(doc.data() as Ticket);
                });

                /* If the search query was not received return the list of retrieved tickets */
                if (!searchQuery) return tickets;

                /* COnvert the search query to lowercase */
                const query = searchQuery.toLocaleLowerCase();

                /* Return the list of tickets filtered by the query */
                return tickets.filter(ticket => {
                    ticket.title.toLocaleLowerCase().includes(query) ||
                    ticket.description.toLocaleLowerCase().includes(query)
                });
            },
            `RetrieveTicketsError`,
            500,
            `Failed to retrieve tickets`
        );
    }

    /**
     * Retrieves tickets where the user is either the author or handler, but not both.
     *
     * @param {string} userId The ID of the user to retrieve tickets for
     * @param {number} limit The number of tickets to retrieve
     * @param {string} orderBy The criteria to order tickets by
     * @param {string} orderDirection The direction of the ordering ("asc" or "desc")
     * @param {string | undefined} searchQuery The query search by the user in the search bar
     * @param {string | undefined} status Optional filter by ticket status
     * @param {string | undefined} priority Optional filter by ticket priority
     * @param {string | undefined} startAfter Optional ticket ID for pagination
     * @returns {Promise<Ticket[]>} List of retrieved tickets
     */
    async getUserTickets(
        userId: string,
        limit: number,
        orderBy: string,
        orderDirection: "asc" | "desc",
        searchQuery?: string,
        status?: string,
        priority?: string,
        startAfter?: string,
    ): Promise<Ticket[]> {
        return executeWithHandling(
            async () => {
                /* Query over the tickets collection where the user is either a ticket handler of the ticket author */
                const buildQuery = (field: "authorId" | "handlerId") => {
                    let q = db.collection(this._dbTicketsCollection)
                        .where(field, "==", userId);

                    /* If the status was received, filter the tickets with the same status */
                    if (status) q = q.where("status", "==", status);
                    
                    /* If the priority was received, filter the tickets with the same priority */
                    if (priority) q = q.where("priority", "==", priority);

                    return q;
                };

                /* Get the list of tickets for both cases */
                const [authorSnap, handlerSnap] = await Promise.all([
                    buildQuery("authorId").select("id", "title", "status", "priority", "authorId", "deadline").get(),
                    buildQuery("handlerId").select("id", "title", "status", "priority", "authorId", "deadline").get(),
                ]);

                /* Merge both cases lists into one */
                let combined: Ticket[] = [
                    ...authorSnap.docs,
                    ...handlerSnap.docs,
                ]
                .map(doc => ({...doc.data() }))
                .filter(ticket => ticket.authorId !== ticket.handlerId) as Ticket[];

                /* Filter the combined tickets based on the searchQuery parameter if it was received */
                if (searchQuery) {
                    combined = combined.filter(ticket => {
                        ticket.title.toLocaleLowerCase().includes(searchQuery) ||
                        ticket.description.toLocaleLowerCase().includes(searchQuery)
                    })
                }

                /* Check if the order field is allowed */
                if (orderBy !== "title" && orderBy !== "deadline" && orderBy !== "createdAt" && orderBy !== "status" && orderBy !== "priority") {
                    throw new AppError(`InvalidOrderField`, 400, `Invalid order criteria`);
                }
                
                /* Sort the combined list based on the order field */
                combined.sort((a, b) => {
                    const aVal = a[orderBy];
                    const bVal = b[orderBy];

                    if (aVal === bVal) return 0;

                    /* Sort in the selected order direction */
                    if (orderDirection === "asc") {
                        return aVal > bVal ? 1 : -1;
                    } else {
                        return aVal < bVal ? 1 : -1;
                    }
                });

                /* Handle pagination manually */
                if (startAfter) {
                    const startIndex = combined.findIndex(ticket => ticket.id === startAfter);
                    if (startIndex >= 0) {
                        return combined.slice(startIndex + 1, startIndex + 1 + limit);
                    }
                }

                /* Return the limited list of tickets */
                return combined.slice(0, limit);
            },
            "RetrieveUserTicketsError",
            500,
            "Failed to retrieve user tickets list"
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @returns {Promise<Ticket>} The data of the ticket
     */
    async getUserTicketById(ticketId: string): Promise<Ticket> {
        return await executeWithHandling(async () => {
            /* Get the ticket reference */
            const ticketRef = await db.collection(this._dbTicketsCollection).doc(ticketId).get();

            /* If the ticket could not be found throw a specific error */
            if (!ticketRef.exists) {
                throw new AppError(`TicketNotFound`, 404, `Ticket not found`);
            }

            console.log(ticketRef.data());

            /* Return the ticket data */
            return ticketRef.data() as Ticket;
            },
            `GetTicketError`,
            500,
            `Failed to retrieve ticket data`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @param {Ticket} updatedTicket The new ticket data
     * @returns {Promise<Ticket>} The updated ticket data
     */
    async updateTicketById(ticketId: string, updatedTicket: Ticket) : Promise<Ticket> {
        return executeWithHandling(
            async () => {
                /* Get the ticket reference */
                const ticketRef = db.collection(this._dbTicketsCollection).doc(ticketId);

                /* Get the ticket document */
                const ticketDoc = await ticketRef.get();

                /* Check if the ticket exists */
                if (!ticketDoc.exists) {
                    throw new AppError(`TicketNotFound`, 404, `Ticket not found. Failed to update ticket data`);
                }

                /* If the ticket status is "Closed" set the ClosedAt value to the current time */
                if (updatedTicket.status === "Closed") {
                    const closedAt = Date.now();

                    await db.collection(this._dbTicketsCollection).doc(ticketId).update({
                        ...updatedTicket,
                        closedAt,
                    });

                    return (await ticketRef.get()).data() as Ticket;
                }

                /* Update the ticket with the data received from the ticketService object*/
                await db.collection(this._dbTicketsCollection).doc(ticketId).update({
                    ...updatedTicket, 
                });

                /* Return the updated ticket */
                return (await ticketRef.get()).data() as Ticket;
            },
            `UpdateTicketError`,
            500,
            `Failed to updated ticket data`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket
     * @param {string} handlerId The ID of the handler
     * @returns {Promise<Ticket>} The updated ticket data
     */
    async assignTicket(ticketId: string, handlerId: string): Promise<Ticket> {
        return executeWithHandling(
            async() => {
                /* Get ticket reference */
                const ticketRef = db.collection(this._dbTicketsCollection).doc(ticketId);

                /* Get the ticket document */
                const ticketDoc = await ticketRef.get();

                /* Check if the ticket exists */
                if (!ticketDoc.exists) {
                    throw new AppError(`TicketNotFound`, 404, `Ticket not found. Faild to assign ticket handler`);
                }

                /* Update the ID of the handler */
                await ticketRef.update({
                    handlerId,
                });

                /* Return the updated ticket */
                return (await ticketRef.get()).data() as Ticket;
            },
            `AssignTicketError`,
            500,
            `Failed to assign ticket handler`
        );
    }

    /**
     * 
     * @param {string} ticketId The ID of the ticket 
     * @returns {Promise<string>} "OK" if the ticekt was deleted, and an error otherwise
     */
    async deleteTicket(ticketId: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get ticket reference */
                const ticketRef = db.collection(this._dbTicketsCollection).doc(ticketId);

                /* Get ticket document */
                const ticketDoc = await ticketRef.get();

                /* Check if the ticket exists */
                if (!ticketDoc.exists) {
                    throw new AppError(`TicketNotFound`, 404, `Ticket not found. Failed to delete ticket`);
                }

                /* Delete ticket */
                await ticketRef.delete();

                /* Return success message */
                return "OK";
            },
            `DeleteTicketError`,
            500,
            `Failed to delete ticket`,
        );        
    }

    /**
     * 
     * @param {number} in24h The next 24h in ms
     * @param {number} now The current time in ms
     * @param {number} day The day time in ms
     * @returns {Promise<Ticket[]>} The list of due tickets
     */
    async checkUpcomingTicketDeadline(in24h: number, now: number, day: number): Promise<Ticket[]> {
        return await executeWithHandling(
            async () => {
                /* Get the tickets reference */
                const ticketsRef = db.collection(this._dbTicketsCollection)
                    .where("notified", "==", false)
                    .where("closedAt", "==", null)
                    .select("id", "title", "authorId", "handlerId", "priority", "type", "deadline");
               
                /* Get the tickets snapshot data */
                const snapshot = await ticketsRef.get();

                const filtered: Ticket[] = [];

                /* Iterate over each ticket */
                snapshot.forEach((doc) => {
                    const ticket = doc.data() as Ticket;
                    
                    /* Get the creation date and the deadline */
                    const { createdAt, deadline } = ticket;

                    /* Get the time left between the deadline and the current time */
                    const timeUntilDeadline = deadline - now;

                    /* Skip the ticket is the deadline is passed */
                    if (timeUntilDeadline < 0) {
                        return;
                    }

                    /* Get the time between the deadline and the creation time */
                    const fullDuration = deadline - createdAt;

                    /* Check if the time to the deadline is smaller than 24h */
                    const isDeadlineSoon = timeUntilDeadline <= day;

                    /* Check if the time to complete the ticket is shorter than a day */
                    const isShortLifespan = fullDuration < day;

                    /* For tickets with deadline shorter than a day,
                        check if half of the time has elapsed */
                    const isMoreThanHalfPassed = timeUntilDeadline < fullDuration / 2;

                    /* If the ticket deadline is due, add the ticket to the list */
                    if (isDeadlineSoon || (isShortLifespan && isMoreThanHalfPassed)) {
                        filtered.push(ticket);
                    }
                });

                return filtered;
            },
            `GetUpcomingTicketDeadlinesError`,
            500,
            `Failed to retreieve upcoming ticket deadllines`
        );
    }

    /**
     * 
     * @param {string} ids The IDs of the tickets
     * @returns {Promise<Ticket[]>} The list of tickets
     */
    async getTickets(ids: string[]): Promise<Ticket[]> {
        return executeWithHandling(
            async () => {
                const tickets: Ticket[] = [];

                /* Iterate over the IDs list */
                for (let i = 0; i < ids.length; i+= 10) {
                    /* Create a chunk of 10 elements (max free chunck limit) */
                    const chunk = ids.slice(i, i + 10);

                    /* Get "chunk" tickets based on the IDs */
                    const snapshot = await db
                        .collection(this._dbTicketsCollection)
                        .where(FieldPath.documentId(), "in", chunk)
                        .get();
                    
                    /* Add each ticket to the list */
                    snapshot.forEach(doc => {
                        tickets.push(doc.data() as Ticket);
                    });
                }

                /* Return the tickets */
                return tickets;
            },
            `RetrieveTicketsError`,
            500,
            `Failed to retrieve tickets list`,
        );
    }
}