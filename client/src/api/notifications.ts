import { getAxiosInstance } from "./axiosInstance";
import { Notification } from "../types/Notification";
import { env } from "../utils/evnValidation";

/* Initialize the axios instance for the notifications service */
const axios = getAxiosInstance(env.REACT_APP_NOTIFICATIONS_END_POINT);

/* POST requests */

/* GET requests */

/**
 * 
 * @param {string} notificationId The ID of the notification
 * @returns {Promise<Notification>} The data of the notification
 */
const getNotification = async (notificationId: string): Promise<Notification> => {
    /* Send the request to the server */
    const response = await axios.get(`/${notificationId}`);

    /* Return the data of the response */
    return response.data.data as Notification;
}

/**
 * 
 * @param {number} limit The number of notifications to retrieve at a fetching request
 * @param {string | undefined} startAfter The ID of the last notification retrieved at the previous fetching request
 * @returns {Promise<Notification[]>} The list of retrieved notifications 
 */
const getUserNotifications = async (limit: number, startAfter?: string): Promise<Notification[]> => {
    /* Send the request to the server */
    const response = await axios.get(`?limit=${limit}&startAfter=${startAfter}`);

    /* Return the list of notifications from the response data */
    return response.data.data as Notification[];
}

const getUnreadNotifications = async (): Promise<Notification[]> => {
    const response = await axios.get(`/unread`);

    return response.data.data as Notification[];
}

/**
 * 
 * @param {string} notificationId The ID of the notification to read
 * @returns {Promise<Notification>} The updated notification data
 */
const readNotification = async(notificationId: string): Promise<Notification> => {
    /* Send the reqeust to the server */
    const response = await axios.put(`/${notificationId}`);

    /* Return the updated notification data from the response data */
    return response.data.data as Notification;
}

export {
    getNotification,
    getUnreadNotifications,
    getUserNotifications,
    readNotification,
};