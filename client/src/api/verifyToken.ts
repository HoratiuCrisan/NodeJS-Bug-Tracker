import axios from 'axios'
import {END_POINT} from './endpoint'

const verifyToken = (token: string) => {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }

    const response = axios.get(`${END_POINT}/api/authorization`, {headers})
        .then(response => {
             console.log(response.data)
        })
        .catch(error => {
            console.error("Failed to send token to the server", error)
        })
}