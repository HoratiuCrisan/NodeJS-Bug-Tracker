import { getAxiosInstance } from "./axiosInstance";
import { env } from "../utils/evnValidation";
import { User } from "../types/User";

/* Initialize the axios instance for the users service */
const axios = getAxiosInstance(env.REACT_APP_USERS_END_POINT);

/* POST requests */

const createNewUser = async (userId: string, email: string, displayName: string, photoUrl: string): Promise<User> => {
    /* Send the request to the server */
    const response = await axios.post("/", {userId, email, displayName, photoUrl});

    /* Return the data of the response */
    return response.data.data as User;
}

const loginUser = async (): Promise<User> => {
    /* Send the request to the server */
    const response = await axios.post(`/login`);

    /* Return the response data */
    return response.data.data as User;
}

/* GET requests */

/**
 * 
 * @param {string} orderBy The order criteria
 * @param {string} orderDirection The direction of the ordering
 * @param {number} limit The number of users to retireve at a fetching requests
 * @param {string | undefined} startAfter The ID of the last user retrieved at the previous fetching request
 * @returns {Promise<User[]>} The list of retrieved users
 */
const getUsers = async (orderBy: string, orderDirection: string, limit: number, startAfter?: string): Promise<User[]> => {
    /* Send the request to the server */
    const response = await axios.get(`?orderBy=${orderBy}&orderDirection=${orderDirection}&limit=${limit}&startAfter=${startAfter}`);

    /* Return the list of users from the response data */
    return response.data.data as User[];
}

/**
 * 
 * @param {string[]} userIds The list of user IDs 
 * @returns {User[]} The list of retrieved users data 
 */
const getUsersData = async (userIds: string[]): Promise<User[]> => {
    /* Send the request to the users server */
    const response = await axios.get(`/data`);

    /* Return the response data */
    return response.data.data as User[];
}

/**
 * 
 * @param {string} userId The ID of the user to retrieve
 * @returns {Promise<User>} The retrieved user data
 */
const getUserById = async (userId: string): Promise<User> => {
    /* Send the request to the server */
    const response = await axios.get(`/${userId}`);

    /* Return the user data from the response data */
    return response.data.data as User;
}

/* PUT requests */

/**
 * 
 * @param displayName The new username of the user
 * @returns {Promsie<User>} The updated user data
 */
const updateDisplayName = async (displayName: string): Promise<User> => {
    /* Send the request to the server */
    const response = await axios.put(`/name`, displayName);

    /* Return the udpated user data from the response data */
    return response.data.data as User;
}

/**
 * 
 * @param {string} email The new user email
 * @returns {Promise<User>} The updated user data
 */
const updateEmail = async (email: string): Promise<User> => {
    /* Send the request to the server */
    const response = await axios.put(`/email`, email);

    /* Return the udpated user data from the response data */
    return response.data.data as User;
}

/**
 * 
 * @param {string} photoUrl The new user photoUrl
 * @returns {Promise<User>} The updated user data
 */
const updatePhotoUrl = async (photoUrl: string): Promise<User> => {
    /* Send the request to the server */
    const response = await axios.put(`/photo`, photoUrl);

    /* Return the updated user data from the response data */
    return response.data.data as User;
}

/**
 * 
 * @param {string} password The new account password
 * @returns {Promise<string>} The success message 
 */
const updatePassword = async (password: string): Promise<string> => {
    /* Send the request to the server */
    const response = await axios.put(`/password`, password);

    /* Return the response data */
    return response.data.data;   
}

/**
 * 
 * @param {string} userId The Id of the user to update
 * @param {string} role The new role of the user 
 * @param {string} userEmail The email address of the updated user
 * @returns {Promise<User>} The updated data of the user
 */
const updateRole = async (userId: string, role: string, userEmail: string): Promise<User> => {
    /* Send the request to the server */
    const response = await axios.put(`/role/${userId}`, {role, userEmail});

    /* Return the udpated user data from the response data */
    return response.data.data as User;
}

/* DELETE reqeusts */

/**
 * 
 * @param {string} userId The ID of the user to be deleted
 * @returns {Promise<string>} The success message
 */
const deleteUser = async (userId: string): Promise<string> => {
    /* Send the request to the server */
    const response = await axios.delete(`/${userId}`);

    /* Return the response data */
    return response.data.data;
}

export {
    createNewUser, 
    loginUser, 
    getUsers, 
    getUsersData,
    getUserById, 
    updateDisplayName, 
    updateEmail, 
    updatePassword, 
    updatePhotoUrl, 
    updateRole, 
    deleteUser
};