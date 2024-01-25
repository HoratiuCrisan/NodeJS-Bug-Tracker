import axios from "axios"
import { END_POINT } from "./endpoint"

const getTickets = async () => {
    try {
        const response = await axios.get(`${END_POINT}/api/get-tickets`)
        
        if (!response)
            return null
        return response
    } catch (error) {   
        console.error(error)
    }
}

export {getTickets}