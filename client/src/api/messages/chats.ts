import { AxiosError } from "axios";
import axios from "axios";
import { CHAT_END_POINT } from "../endpoint";
import { Console } from "console";

const getUserConversations = async (conversationId: string | undefined) => {
    if (!conversationId) {
        throw new Error("Error! No conversation id provided");
    }

    try {
        const response = await axios.get(`${CHAT_END_POINT}/conversations/${conversationId}/messages`);

        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(error);
    }
}

const createConversation = async (conversationId: string | undefined, participants: string[]) => {
    if (!conversationId) {
        throw new Error("Error! No conversation id provided");
    }

    if (!participants || participants.length !== 2) {
        throw new Error("Error! Number of participants is not supported");
    }

    try {
        console.log(conversationId, participants);
        const response = await axios.post(`${CHAT_END_POINT}/conversations`, {
            conversationId, 
            participants
        });

        if (!response) {
            console.error("Failed to create conversation");
        }

        return response.data;
    } catch (error) {
        console.error("Error sending the request to the server ", error);
    }
}

export { getUserConversations, createConversation}