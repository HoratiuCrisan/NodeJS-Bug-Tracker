import axios from "axios"
import { TICKETS_END_POINT } from "./endpoint"
import { Ticket } from "../utils/types/Ticket"

interface CreateTicketProps {
    formData: TicketFormData
    author: string | undefined | null
    authorPicture: string | undefined | null
}

interface TicketFormData {
    title: string
    description: string
    priority: {
        value: string
        label: string
    }
    type: {
        value: string
        label: string
    }
    deadline: string
}

const createTicket = async ({formData, author, authorPicture} : CreateTicketProps) => {
    try {
        const result = await axios.post(`${TICKETS_END_POINT}/`, {
            formData, 
            author,
            authorPicture
        })
        console.log(result)
        return result
    } catch (error) {
        console.error(error)
    }
}

export {createTicket}