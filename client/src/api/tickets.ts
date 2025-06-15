import { env } from "../utils/evnValidation";
import { getAxiosInstance } from "./axiosInstance";
import { Ticket, RequestTicket, TicketCardType, TicketObject } from "../types/Ticket"

const axios = getAxiosInstance(env.REACT_APP_TICKETS_END_POINT);

/* POST reqeusts */

/**
 * 
 * @param {string} title The title of the ticket
 * @param {string} description The description of the ticket
 * @param {string} priority The type of priority of the ticket
 * @param {string} type The type of ticket
 * @param {number} deadline The deadline of the ticket
 * @returns {Promsie<Ticket>} The ticket object from the server
 */
const createTicket = async (
    title: string,
    description: string,
    priority: string,
    type: string,
    deadline: number
): Promise<Ticket> => {
    /* Send the post request to the server */
    const response = await axios.post("/", {title, description, priority, type, deadline});

    /* Return the data of the axios response */
    return response.data.data as Ticket;
} 

/* GET requests */

/**
 * Only admins can fetch the tickets that are not associated with them 
 * 
 * @param {number} limit The number of tickets to retrieve at a fetching request 
 * @param {string} orderBy The order criteria of the tickets
 * @param {string} orderDirection The ordering direction
 * @param {string | undefined} searchQuery The query search from the user
 * @param {string | undefined} priority The priority of the tickets
 * @param {stirng | undefined} status The status of the tickets
 * @param {string | undefined} startAfter The ID of the last ticket retrieved at the last fetching request
 * @returns {Promise<TicketCardType[]>} The list of retrieved tickets with some data of the author
 */
const getAllTickets = async (
    limit: number, 
    orderBy: string, 
    orderDirection: string,
    searchQuery?: string,
    priority?: string,
    status?: string,
    startAfter?: string
): Promise<TicketCardType[]> => {
    /* Send the request to the server */
    const response = await axios.get(`?limit=${limit}&orderBy=${orderBy}&orderDirection=${orderDirection}&searchQuery=${searchQuery}&priority=${priority}&status=${status}&startAfter=${startAfter}`);

    /* Add the data of the response to a list of tickets that also have the data of their authors */
    const ticketCards: RequestTicket[] = response.data.data;

    /* Iterate over each ticket card and return the ticket data with the profile photo of the author */
    return ticketCards.map((card: RequestTicket) => {
        return {
            ...card.ticket,
            authorPhoto: card.user.photoUrl
        }
    });
}

/**
 * 
 * @param userId The ID of the user that sent the request
 * @param {number} limit The number of tickets to retrieve at a fetching request 
 * @param {string} orderBy The order criteria of the tickets
 * @param {string} orderDirection The ordering direction
 * @param {string | undefined} searchQuery The query search from the user
 * @param {string | undefined} priority The priority of the tickets
 * @param {stirng | undefined} status The status of the tickets
 * @param {string | undefined} startAfter The ID of the last ticket retrieved at the last fetching request
 * @returns {Promise<TicketCardType[]>} The list of retrieved tickets with some data of the author
 */
const getUserTickets = async(
    userId: string,
    limit: number,
    orderBy: string,
    orderDirection: string,
    searchQuery?: string,
    priority?: string,
    status?: string,
    startAfter?: string
): Promise<TicketCardType[]> => {
    /* Send the request to the server */
    const response = await axios.get(`/${userId}?limit=${limit}&orderBy=${orderBy}&orderDirection=${orderDirection}&searchQuery=${searchQuery}&priority=${priority}&status=${status}&startAfter=${startAfter}`);
    
    /* Add the data of the response to a list of tickets that also have the data of their authors */
    const ticketCards: RequestTicket[] = response.data.data;

    /* Iterate over each ticket card and return the ticket data with the profile photo of the author */
    return ticketCards.map((card: RequestTicket) => {
        return {
            ...card.ticket,
            authorPhoto: card.user.photoUrl
        }
    });
}

/**
 * 
 * @param {string} userId The ID of the user that sent the request
 * @param {string} ticketId The ID of the ticket
 * @returns {Promise<TicketObject>} The data of the ticket and the data of the author and handler if assigend
 */
const getUserTicketById = async (userId: string, ticketId: string): Promise<TicketObject> => {
    /* Send the data to the server */
    const response = await axios.get(`/${userId}/${ticketId}`);

    /* Return the data of the response */
    return response.data.data as TicketObject;
}

/* PUT requests */

/**
 * 
 * @param {string} ticketId The ID of the ticket to update
 * @param {Ticket} data The updated ticket data
 * @returns {Promise<Ticket>} The updated ticket data
 */
const updateTicketById = async(ticketId: string, data: Ticket): Promise<Ticket> => {
    console.log(data);
    /* Send the request to the server */
    const response = await axios.put(`/${ticketId}`, {data});
    
    /* Return the data of the response */
    return response.data.data;
}

/**
 * 
 * @param {string} ticketId The ID of the ticket 
 * @param {string} handlerId The ID of the new ticket handler
 * @param {string} handlerEmail The email of the handler
 * @param {string} authorEmail The email address of the ticket author
 * @returns {Promise<Ticket>} The updated ticket data
 */
const assignTicket = async (ticketId: string, handlerId: string, handlerEmail: string, authorEmail: string): Promise<Ticket> => {
    /* Send the request to the server */
    const response = await axios.put(`/assign/${ticketId}`, {handlerId, handlerEmail, authorEmail});

    /* Return the response data */
    return response.data.data;
}

/* DELETE requests */

/**
 * 
 * @param {string} ticketId The ID of the ticket
 * @returns {Promise<string>} The success message 
 */
const deleteTicketById = async (ticketId: string): Promise<string> => {
    /* Send the request to the server */
    const response = await axios.delete(`/${ticketId}`);

    /* Return the data of the response */
    return response.data.data;
}

export {
    createTicket, 
    getAllTickets,
    getUserTickets, 
    getUserTicketById, 
    updateTicketById, 
    assignTicket, 
    deleteTicketById
};
