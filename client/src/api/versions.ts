import { getAxiosInstance } from "./axiosInstance";
import { TicketVersion, TaskVersion, SubtaskVersion } from "../types/Versions";
import { env } from "../utils/evnValidation";

/* Initialize the axios instance for the version service */
const axios = getAxiosInstance(env.REACT_APP_VERSIONS_END_POINT);

/* GET requests */

/**
 * 
 * @param {string} itemId The ID of the item
 * @param {string} versionId The ID of the item version
 * @param {string} type The type of item
 * @returns {Promise<Version>} The version data of the item
 */
const getItemVersion = async (itemId: string, versionId: string, type: string): Promise<TicketVersion | TaskVersion | SubtaskVersion> => {
    /* Send the request to the version server */
    const response = await axios.get(`/${type}/${itemId}/${versionId}`);

    /* Return the response data */
    return response.data.data;
}

/**
 * 
 * @param {string} itemId The ID of the item
 * @param {string} type The type of item
 * @param {number} limit The number of versions to retrieve 
 * @param {string | undefined} startAfter The ID of the last item version retrieved at the previous fetching request
 * @returns {Promise<Version[]>} The list of item versions retrieved
 */
const getItemVersions = async (itemId: string, type: string, limit: number, startAfter?: string): Promise<TicketVersion[] | TaskVersion[] | SubtaskVersion[]> => {
    /* Send the reqeust to the version server */
    const response = await axios.get(`/${type}/${itemId}?limit=${limit}&startAfter=${startAfter}`);

    console.log(response);

    /* Return the response data */
    if (type === "ticket") return response.data.data as TicketVersion[];

    if (type === "task") return response.data.data as TaskVersion[];

    return response.data.data as SubtaskVersion[];
}

/**
 * 
 * @param {string} itemId The ID of the item
 * @param {string} type The type of item
 * @param {number} limit The number of versions to retrieve 
 * @param {string | undefined} startAfter The ID of the last item version retrieved at the previous fetching request
 * @returns {Promise<TicketVersion[]>} The list of item versions retrieved
 */
const getTicketVersions = async (itemId: string, type: string, limit: number, startAfter?: string): Promise<TicketVersion[]> => {
    /* Send the reqeust to the version server */
    const response = await axios.get(`/${type}/${itemId}?limit=${limit}&startAfter=${startAfter}`);

    /* Return the response data */
    return response.data.data as TicketVersion[];
}

/* PUT requests */

/* DELETE requests */

/**
 * 
 * @param {string} itemId The ID of the item
 * @param {string} type The type of item
 * @param {string[]} versions The list of version IDs to delete
 * @returns {Promise<string>} The success message
 */
const deleteItemVersions = async (itemId: string, type: string, versions: string[]): Promise<string> => {
    /* Send the reqeust to the version server */
    const response = await axios.delete(`/${type}/${itemId}/versions`, {data: versions});
    
    /* Return the response data */
    return response.data.data as string;
}


/**
 * Removes the item from the type and all of its versions
 * 
 * @param {string} itemId The ID of the item
 * @param {string} type The type of item
 * @returns {Promise<string>} The success message
 */
const deleteItem = async (itemId: string, type: string): Promise<string> => {
    /* Send the request to the server */
    const response = await axios.delete(`/${type}/${itemId}`);

    /* Return the response data */
    return response.data.data;
}

export {
    getItemVersion,
    getItemVersions,
    getTicketVersions,
    deleteItemVersions,
    deleteItem,
};