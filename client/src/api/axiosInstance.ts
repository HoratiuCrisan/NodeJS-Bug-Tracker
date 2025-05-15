import axios, { AxiosError, AxiosInstance, AxiosResponse, AxiosStatic } from "axios";
import { ApiSuccess, ApiError } from "../utils/types/Api";

/**
 * 
 * @param endpoit The service endpoint to initialize
 * @returns The axios instance for a specific endpoint
 */
const getAxiosInstance = (endpoit: string) => {
    const axiosInstance = axios.create({
        baseURL: endpoit,
        timeout: 500,
        headers: {
            "Content-Type": "application/json",
        },
    });

    axiosInstance.interceptors.response.use(
        /* Check if the success of the response if false, and throw an unexpected error */
        (response: AxiosResponse<ApiSuccess<unknown>>) => {
            if (!response.data.success) {
                return Promise.reject({
                    isHandledAppError: true,
                    message: response.data.message,
                    name: "ApplicationError",
                });
            }
            return response;
        },
        /* Handle the error cases for the axios requests */
        (error: AxiosError<ApiError>) => {
            /* Check if the error is thrown by the server */
            if (error.response) {
                return Promise.reject({
                    isHandledHttpError: true,
                    httpCode: error.response.status, /* The http code return from the server */
                    message: error.response.data.message,
                    name: error.response.data.name,
                });
            /* Check if the error is caused by a network issue */
            } else if (error.response) {
                return Promise.reject({
                    isNetworkError: true,
                    message: "No response received from the server",
                    name: "NetworkError"
                });
            /* Handle any unexpected errors */
            } else {
                return Promise.reject({
                    isUnknownError: true,
                    message: error.message || "Unexpected error",
                    name: "UnknownError",
                });
            }
        }
    );
    
    return axiosInstance;
}

export { getAxiosInstance };