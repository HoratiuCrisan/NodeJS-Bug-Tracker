import axios from "axios"
import { env } from "process";
import { Ticket, RequestTicket, TicketCard, TicketObject } from "../utils/types/Ticket"

const getAllTickets = async (
    limit: number, 
    orderBy: string, 
    orderDirection: string,
    searchQuery?: string,
    priority?: string,
    status?: string,
    startAfter?: string
): Promise<TicketCard[]> => {
    try {
        
        const response = await axios.get(`${process.env.TICKETS_END_POINT}?limit=${limit}&orderBy=${orderBy}&orderDirection=${orderDirection}`);

        const responseData = response.data;

        if (!responseData.success) {
            throw new Error(`Invalid request data`);
        }

        const ticketCards: RequestTicket[] = responseData.data;

        const tickets: TicketCard[] = ticketCards.map((card: RequestTicket) => {
            return {
                ...card.ticket,
                authorPhoto: card.user.photoUrl
            };
        });

        return tickets;
    } catch (error) {   
        console.error(error)
        throw new Error(`Failed to retrieve tickets data`);
    }
}

const getUserTicketById = async(userId: string, ticketId: string) => {
    try {
        const response = await axios.get(`${process.env.TICKETS_END_POINT}/${userId}/${ticketId}`);

        const responseData = response.data;

        if (!responseData.success) {
            throw new Error(`Invalid request data`);
        }

        const ticket: TicketObject = responseData.data;
        
        return ticket;
    } catch (error) { 
        console.error(error)
    }
}

const getTicketsByUsername = async(
    userId: string,
    limit: number,
    orderBy: string,
    orderDirection: string,
    searchQuery?: string,
    priority?: string,
    status?: string,
    startAfter?: string
): Promise<TicketCard[]> => {
    try {
        const response = await axios.get(`
            ${process.env.TICKETS_END_POINT}/${userId}?limit=${limit}&orderBy=${orderBy}&orderDirection=${orderDirection}`
        );

        const responseData = response.data;

        if (!responseData.success) {
            throw new Error(`Invalid request data`);
        }

        const ticketCards: RequestTicket[] = responseData.data;

        const tickets: TicketCard[] = ticketCards.map((card: RequestTicket) => {
            return {
                ...card.ticket,
                authorPhoto: card.user.photoUrl
            };
        });

        return tickets;
    } catch (error) {
        console.error(error);
        throw new Error("Error at sending the request! " + error);
    }
}

const updateTicketById = async(id: string, updateData: Ticket, author: string | null) => {
    if (!author) {
        throw new Error("No author provided!");
    }

    try {
        const response = await axios.put(`${process.env.TICKETS_END_POINT}/${id}`, {updateData, author})

        if (!response)
            return null
        return response
    } catch (error) {
        console.error(error)
    }
}

const deleteTicketById = async (id: string) => {
    try {
        const response = await axios.delete(`${process.env.TICKETS_END_POINT}/${id}`)

        if (!response)
            return null

        return response
    } catch (error) {
        console.error(error)
    }
}

export {getAllTickets, getUserTicketById, updateTicketById, deleteTicketById, getTicketsByUsername}
