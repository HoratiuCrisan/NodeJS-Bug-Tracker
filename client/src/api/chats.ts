import { getAxiosInstance } from "./axiosInstance";
import { ChatConversation, Message, MessageMedia } from "../types/Chat";
import { env } from "../utils/evnValidation";

/* Initialize the axios instance for the chats service */
const axios = getAxiosInstance(env.REACT_APP_CONVERSATIONS_END_POINT);

/* POST reqeusts */

const uploadConversationFile = async (file: File): Promise<MessageMedia> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`/upload/files`, formData);

    console.log(response);

    return response.data.data;
}

/**
 * 
 * @param {string} receiverId The ID of the other user 
 * @returns {Promise<Conversation>} The data of the created conversation
 */
const createConversation = async (receiverId: string): Promise<ChatConversation> => {
    /* Send the request to the chats server */
    const response = await axios.post(`/`, {receiverId});

    /* Return the response data */
    return response.data.data as ChatConversation;
}

/**
 * 
 * @param {string} converstaionId The ID of the conversation
 * @param {string} text The text message sent by the user 
 * @param {MessageMedia[] | null} media The media message sent by the user
 * @returns {Promise<Message>} The generated message object
 */
const addConversationMessage = async (converstaionId: string, text: string, media: MessageMedia[] | null): Promise<Message> => {
    /* Send the request to the chats server */
    const response = await axios.post(`/${converstaionId}`, {text, media});

    /* Return the response data */
    return response.data.data as Message;
}

/* GET requests */

/**
 * 
 * @param {string} conversationId The ID of the conversation
 * @returns {Promise<Conversation>} The data of the conversation object
 */
const getConversation = async (conversationId: string): Promise<ChatConversation> => {
    /* Send the request to the chat server */
    const response = await axios.get(`/${conversationId}`);

    /* Return the response data */
    return response.data.data as ChatConversation;
}

const checkConversation = async (receivedId: string): Promise<ChatConversation | null> => {
    const response = await axios.get(`/exists/${receivedId}`);

    const data = response.data.data;

    if (!data) return null;

    return data as ChatConversation;
}

/**
 * 
 * @returns {Promise<Conversation[]>} The list of conversation objects
 */
const getUserConversations = async (): Promise<ChatConversation[]> => {
    /* Send the reqeust to the chats server */
    const response = await axios.get(`/`);

    /* Return the response data */
    return response.data.data as ChatConversation[];
}

/**
 * 
 * @param {string} conversationId The ID of the conversation
 * @param {number} limit The number of messages to retrieve
 * @param {string | undefined} startAfter The ID of the last message retrieved at the previous fetching request 
 * @returns {Promise<Message[]>} The list of message objects retrieved
 */
const getConversationMessages = async (conversationId: string, limit: number, startAfter?: string): Promise<Message[]> => {
    /* Send the request to the chats server */
    const response = await axios.get(`/${conversationId}/messages?limit=${limit}&startAfter=${startAfter}`);

    /* Return the data of the response */
    return response.data.data as Message[];
}

/**
 * 
 * @param {string} conversationId The ID of the conversation
 * @returns {Promise<Message[]>} The list of message objects retrieved
 */
const getUnreadConversationMessages = async (conversationId: string): Promise<Message[]> => {
    /* Send the request to the chats server */
    const response = await axios.get(`/${conversationId}/messages/unread`);

    /* Return the response data */
    return response.data.data as Message[];
}

/**
 * 
 * @param {string} conversationId The ID of the conversation
 * @param {string} messageId The ID of the message
 * @returns {Promsie<Message>} The retrieved message object
 */
const getConversationMessage = async (conversationId: string, messageId: string): Promise<Message> => {
    /* Send the request to the chats server */
    const response = await axios.get(`/${conversationId}/messages/${messageId}`);

    /* Return the response data */
    return response.data.data as Message;
}

/* PUT requests */

/**
 * 
 * @param {string} conversationId The ID of the conversation
 * @param {string} messageId The ID of the message to update
 * @param {string} text The new text message
 * @returns {Promise<Message>} The updated message object
 */
const updateConversationMessage = async (conversationId: string, messageId: string, text: string): Promise<Message> => {
    /* Send the request to the chats server */
    const response = await axios.put(`/${conversationId}/${messageId}`, text);

    /* Return the response data */
    return response.data.data as Message;
}

/**
 * 
 * @param {string} conversationId The ID of the conversation
 * @param {string} messages The list of message IDs to be read
 * @returns {Promise<Message[]>} The list of read messages objects
 */
const viewConversationMessages = async (conversationId: string, messages: string[]): Promise<Message[]> => {
    /* Send the request to the chats server */
    const response = await axios.put(`/${conversationId}/messages/view`, {messages});

    /* Return the response data */
    return response.data.data as Message[];
}

/* DELETE reqeusts */

/**
 * 
 * @param conversationId The ID of the conversation
 * @returns {Promise<string>} The success message
 */
const deleteConversation = async (conversationId: string): Promise<string> => {
    /* Send the request to the chats server */
    const response = await axios.delete(`/${conversationId}`);

    /* Return the response data */
    return response.data.data as string;
}

/**
 * 
 * @param {string} conversationId The ID of the conversation
 * @param {string} messages The list of message IDs to be deleted
 * @returns {Promise<string>} The success message
 */
const deleteConversationMessages = async (conversationId: string, messages: string[]): Promise<string> => {
    /* Send the reqeust to the chats server */
    const response = await axios.delete(`/${conversationId}/messages`, {data: messages});

    /* Return the response data */
    return response.data.data as string;
}

export {
    uploadConversationFile,
    createConversation,
    addConversationMessage,
    checkConversation, 
    getConversation,
    getUserConversations,
    getUnreadConversationMessages,
    getConversationMessage,
    getConversationMessages,
    updateConversationMessage,
    viewConversationMessages,
    deleteConversation,
    deleteConversationMessages,
};