import axios from "axios"
import { PROJECT_END_POINT, USERS_END_POINT } from "./endpoint"

const getUserData = async (userId: string) => {
    if (!userId || userId.length === 0) {
        throw new Error (`User ${userId} is not a valid user`);
    }

    try {
        const response = await axios.get(`${USERS_END_POINT}/${userId}`);

        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(error);
    }
}

const getUsers = async () => {
    try {
        const response = await axios.get(`${PROJECT_END_POINT}/users`)

    if (!response )
        return null

    return response.data
    } catch (err) {
        console.error(err)
    }

}

const setUserRole = async (uid: string, role: string) => {
    if (uid === null || uid === undefined || uid.length === 0) {
        throw new Error("Error! No user id was specified!");
    }

    if (role === null || role === undefined || role.length === 0) {
        throw new Error("Error! No role was specified!");
    }

    try {
        const response = await axios.post(`${USERS_END_POINT}/setClaims`, {
            uid: uid,
            role: role,
        });

        return response.statusText;
    } catch (error) {
        console.error("Error at sending the request: " + error);
        throw new Error("Error sending the request: " + error);
    }
}

const getAllUsers = async () => {
    try {
        const response = await axios.get(`${USERS_END_POINT}`);

        if (response) {
            return response.data;
        }

        return null
    } catch (error) {
        console.error("Error at sending the request: " + error);
    }
}

export {getUsers, setUserRole, getAllUsers, getUserData}