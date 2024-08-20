import axios from "axios";
import { CHAT_END_POINT } from "../endpoint";

const getAllUsersForChats = async () => {
    try {
        const response = await axios.get(`${CHAT_END_POINT}/users`);

        if (!response) {
            throw new Error("Error! Failed to fetch all users from the server!");
        }

        return response.data;
    } catch (error) {
        console.log("Failed to send request to the server: " + error);
    }
}

export {getAllUsersForChats}