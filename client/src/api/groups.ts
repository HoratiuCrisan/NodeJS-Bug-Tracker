import { getAxiosInstance } from "./axiosInstance";
import { GroupConversation, Message, MessageMedia } from "../utils/types/Chat";
import {env} from "../utils/evnValidation";

/* Initialize the axios instance for the groups service */
const axios = getAxiosInstance(env.REACT_APP_GROUPS_END_POINT);

/* POST requests */

/**
 * 
 * @param {string} title The title of the group chat
 * @param {string} description The description of the group chat
 * @param {string} members The list of member IDs of the group chat
 * @param {string} photoUrl The profile photo of the group chat
 * @returns {Promise<GroupConversation>} The created group object
 */
const createGroup = async (title: string, description: string, members: string[], photoUrl: string): Promise<GroupConversation> => {
    /* Send the request to the groups server */
    const response = await axios.post(`/`, {title, description, members, photoUrl});

    /* Return the response data */
    return response.data.data as GroupConversation;
}

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @param {string} text The text message sent by the user
 * @param {MessageMedia | null} media The media data sent by the user
 * @returns {Promise<Message>} The created group chat message
 */
const addGroupMessage = async (groupId: string, text: string, media: MessageMedia | null): Promise<Message> => {
    /* Send the request to the group server */
    const response = await axios.post(`/${groupId}`, {text, media});

    /* Return the data of the response */
    return response.data.data as Message;
}

/* GET requests */

/**
 * 
 * @param {string} groupId The ID of the group
 * @returns {Promsie<GroupConversation>} The data of the group conversation
 */
const getGroupData = async (groupId: string): Promise<GroupConversation> => {
    /* Send the request to the group server */
    const response = await axios.get(`/${groupId}`);

    /* Return the response data */
    return response.data.data as GroupConversation;
}

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @param {number} limit The number of messages to retrieve
 * @param {string | undefined} startAfter The ID of the last message retrieved at the previous fetching request
 * @returns {Promsie<Message[]>} The retrieved messages list
 */
const getGroupMessages = async (groupId: string, limit: number, startAfter?: string): Promise<Message[]> => {
    /* Send the request to the group server */
    const response = await axios.get(`/${groupId}/messages?limit=${limit}&startAfter=${startAfter}`);

    /* Return the list of retrieved messages */
    return response.data.data as Message[];
}

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @returns {Promise<Message[]>} The list of retrieved unread messages
 */
const getUnreadGroupMessages = async (groupId: string): Promise<Message[]> => {
    /* Send the reqeust to the groups server */
    const response = await axios.get(`/${groupId}/messages/unread`);

    /* Return the response data */
    return response.data.data as Message[];
}

/* PUT requests */

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @param {string} title The new title of the group conversation
 * @returns {Promise<GroupConversation>} The updated data of the group conversation
 */
const updateGroupTitle = async (groupId: string, title: string): Promise<GroupConversation> => {
    /* Send the request to the group server */
    const response = await axios.put(`/${groupId}/title`, title);

    /* Return the response data */
    return response.data.data as GroupConversation;
}

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @param {string} description The new description of the group conversation
 * @returns {Promise<GroupConversation>} The updated group conversation data
 */
const updateGroupDescription = async (groupId: string, description: string): Promise<GroupConversation> => {
    /* Send the request to the group server */
    const response = await axios.put(`/${groupId}/description`, description);

    /* Return the response data */
    return response.data.data as GroupConversation;
}

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @param {string} photoUrl The new profile photo of the group conversation
 * @returns {Promise<GroupConversation>} The updated group conversation data
 */
const updateGroupPhoto = async (groupId: string, photoUrl: string): Promise<GroupConversation> => {
    /* Send the request to the group server */
    const response = await axios.put(`/${groupId}/photo`, photoUrl);

    /* Return the response data */
    return response.data.data as GroupConversation;
}

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @param {string[]} members The list of of new user IDs to be added to the group conversation
 * @returns {Promise<GroupConversation>} The updated gropu conversation data
 */
const addMembers = async (groupId: string, members: string[]): Promise<GroupConversation> => {
    /* Send the reqeust to the group server */
    const response = await axios.put(`/${groupId}/addMembers`, members);

    /* Return teh response data */
    return response.data.data as GroupConversation;
}

/**
 * 
 * @param groupId The ID of the group conversation
 * @param members The list of user IDs to be removed from the group conversation 
 * @returns {Promise<GroupConversation>} The updated group conversation
 */
const removeMembers = async (groupId: string, members: string[]): Promise<GroupConversation> => {
    /* Send the reqeust to the group server */
    const response = await axios.put(`/${groupId}/removeMembers`, members);

    /* Return the resposne data */
    return response.data.data as GroupConversation;
}

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @param {string[]} messages The list of message IDs to read
 * @returns {Promise<Message[]>} The list of updated messages
 */
const viewGroupMessages = async (groupId: string, messages: string[]): Promise<Message[]> => {
    /* Send the request to the group server */
    const response = await axios.put(`/${groupId}/viewMessages`, messages);

    /* Return the viewed messages from the response data */
    return response.data.data as Message[];
}

/* DELETE requests */

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @returns {Promise<string>} The success message
 */
const deleteGroup = async (groupId: string): Promise<string> => {
    /* Send the request to the group server */
    const response = await axios.delete(`/${groupId}`);

    /* Return the response data */
    return response.data.data as string;
}

/**
 * 
 * @param {string} groupId The ID of the group conversation
 * @param {string} messages The list of message IDs to be deleted
 * @returns {Promise<string>} The success messages
 */
const deleteGroupMessages = async (groupId: string, messages: string[]): Promise<string> => {
    /* Send the reqeust to the group server */
    const response = await axios.delete(`/${groupId}/messages`, {data: messages});

    /* Return the response message */
    return response.data.data;
}

export {
    createGroup,
    addGroupMessage,
    getGroupData,
    getGroupMessages,
    getUnreadGroupMessages,
    updateGroupTitle,
    updateGroupDescription,
    viewGroupMessages,
    updateGroupPhoto,
    addMembers,
    removeMembers,
    deleteGroup,
    deleteGroupMessages,
};