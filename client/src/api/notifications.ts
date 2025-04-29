import { NOTIFICATIONS_END_POINT } from "./endpoint";
import axios from "axios";
import { Notification } from "../utils/types/Notification";

const getUserNotifications = async (userId: string) => {
    if (!userId) {
        throw new Error("Error! User id was not provided!");
    }

    try {
        const response = await axios.get(`${NOTIFICATIONS_END_POINT}/${userId}`);
        
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error("Error getting user notifications from the server: ", error);
    } 
}

const getNotification = async (userId: string, notificationId: number) => {
    if (!userId) {
        throw new Error("Error! User id was not provided!");
    }

    if (notificationId < 0 || notificationId === null || notificationId === undefined) {
        throw new Error("Error! Notification id was not provided!");
    }

    try {
        const response = await axios.get(`${NOTIFICATIONS_END_POINT}/${userId}/${notificationId}`);

        if (response) {
            return response.data;
        }

        return response;
    } catch (error) {
        console.error("Error getting notification");
    }
}

const updateUserNotification = async (userId: string, notificationId: number) => {
    if (!userId) {
        throw new Error("Error! User id was not provided!");
    }

    if (!notificationId || notificationId < 0) {
        throw new Error("Error! Notification id is not valid");
    }

    try {
        const response = await axios.put(`${NOTIFICATIONS_END_POINT}/${userId}/${notificationId}`);
    
        if (!response) {
            return response;
        }

        return response.data;
    } catch (error) {
        console.error("Error updating the notification");
    }
}

export { getUserNotifications, getNotification, updateUserNotification}