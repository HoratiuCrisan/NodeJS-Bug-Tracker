import axios from "axios"
import { TICKETS_END_POINT } from "./endpoint"
import { Ticket } from "../utils/interfaces/Ticket"

const getAllTickets = async () => {
    try {
        const response = await axios.get(`${TICKETS_END_POINT}`)
        
        if (!response)
            return null
        return response.data
    } catch (error) {   
        console.error(error)
    }
}

const getTicketByUsernameAndId = async(username: string, id: string) => {
    try {
        const response = await axios.get(`${TICKETS_END_POINT}/${username}/${id}`)

        if (!response)
            return null
        console.log("fetched ticket: " + response.data)
        return response
    } catch (error) { 
        console.error(error)
    }
}

const getTicketsByUsername = async(username: string) => {
    if (!username) {
        throw new Error("Error! No username provided!");
    }

    try {
        console.log("username to fetch tickets: " + username);
        const response = await axios.get(`${TICKETS_END_POINT}/${username}?limit=${10}&orderBy=Title&orderDirection=asc`);

        if (!response) {
            throw new Error("Error fetching tickets!");
        }

        return response.data;
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
        const response = await axios.put(`${TICKETS_END_POINT}/${id}`, {updateData, author})

        if (!response)
            return null
        return response
    } catch (error) {
        console.error(error)
    }
}

const deleteTicketById = async (id: string) => {
    try {
        const response = await axios.delete(`${TICKETS_END_POINT}/${id}`)

        if (!response)
            return null

        return response
    } catch (error) {
        console.error(error)
    }
}

export {getAllTickets, getTicketByUsernameAndId, updateTicketById, deleteTicketById, getTicketsByUsername}
