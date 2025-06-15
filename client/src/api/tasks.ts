import { getAxiosInstance } from "./axiosInstance";
import { Task, Subtask, Response, TaskCard, SubtaskCard } from "../types/Tasks";
import { env } from "../utils/evnValidation";

/* Initialize the axios instance for the task service */
const axios = getAxiosInstance(env.REACT_APP_TASKS_END_POINT);

/* POST requests */

/**
 * 
 * @param {string} projectId The ID of the project the task is part of
 * @param {string[]} handlerIds The list of handler IDs
 * @param {string} description The description of the task
 * @param {number} deadline The deadline of the teask
 * @returns {Promise<Task>} The created task object
 */
const createTask = async (projectId: string, handlerIds: string[], description: string, deadline: number): Promise<Task> => {
    /* Send the request to the task server */
    const response = await axios.post(`/`, {projectId, handlerIds, description, deadline});

    /* Return the response data */
    return response.data.data as Task;
}

/**
 * 
 * @param {string} taskId The ID of the task the subtask will be part of
 * @param {string} handlerId The handler ID of the subtask
 * @param {string} description The description of the subtask
 * @returns {Promise<Subtask>} The created subtask object
 */
const createSubtask = async (taskId: string, handlerId: string, description: string): Promise<Subtask> => {
    /* Send the request to the task server */
    const response = await axios.post(`/${taskId}`, {handlerId, description});

    /* Return the response data */
    return response.data.data as Subtask;
}

/**
 * 
 * @param {string} taskId The ID of the task the response is part of 
 * @param {string} message The text message of the response
 * @returns {Promise<Response>} The created response object
 */
const createTaskResponse = async (taskId: string, message: string): Promise<Response> => {
    /* Send the request to the task server */
    const response = await axios.post(`/${taskId}/response`, {message});

    /* Return the response data */
    return response.data.data as Response;
}

/* GET requests */

/**
 * 
 * @param {string} projectId The ID of the project the tasks are part of
 * @param {number} limit The number of tasks to retrieve
 * @param {string} orderBy The order criteria
 * @param {string} orderDirection The direction of the ordering
 * @param {string | null} startAfter The ID of the last project task retrieved at the previous fetching request
 * @returns {Promise<TaskCard[]>} The list of task objects retrieved
 */
const getTasks = async (projectId: string, limit: number, orderBy: string, orderDirection: string, startAfter: string | null): Promise<TaskCard[]> => {
    /* Send the request to the task server */
    const response = await axios.get(`/${projectId}?limit=${limit}&orderBy=${orderBy}&orderDirection=${orderDirection}&startAfter=${startAfter}`);
    console.log(response);
    /* Return the response data */
    return response.data.data as TaskCard[];
}

/**
 * 
 * @param {string} projectId The ID of the project the task is part of
 * @param {string} taskId The ID of the task
 * @returns {Promise<TaskCard>} The retrived task and members data
 */
const getTaskById = async(projectId: string, taskId: string): Promise<TaskCard> => {
    /* Send the reqeust to the task server */
    const response = await axios.get(`/${projectId}/${taskId}`);

    /* Return the response data */
    return response.data.data as TaskCard;
}

/**
 * 
 * @param {string} taskId The ID of the task
 * @returns {Promise<Subtask[]>} The list of task subtasks
 */
const getSubtasks = async (taskId: string): Promise<Subtask[]> => {
    /* Send the request to the task server */
    const response = await axios.get(`/${taskId}/subtasks`);

    /* Return the response data */
    return response.data.data;
}

/**
 * 
 * @param {string} taskId The ID of the task the subtask is part of
 * @param {string} subtaskId The ID of the subtask
 * @returns {Promise<SubtaskCard>} The subtask and users data
 */
const getSubtaskById = async (taskId: string, subtaskId: string): Promise<SubtaskCard> => {
    /* Send the request to the server */
    const response = await axios.get(`/${taskId}/subtasks/${subtaskId}`);

    /* Return the response data */
    return response.data.data as SubtaskCard;
}

/**
 * 
 * @param {string} taskId The ID of the task the responses are part of
 * @returns {Promise<Response[]>} The list of task responses
 */
const getResponses = async (taskId: string): Promise<Response[]> => {
    /* Send the request to the task server */
    const response = await axios.get(`/${taskId}/responses`);

    /* Return the response data */
    return response.data.data;
}

/* PUT requests */

/**
 * 
 * @param {string} taskId The ID of the task
 * @param {string} description The new task description
 * @returns {Promise<Task>} The updated task data
 */
const updateTaskDescription = async (taskId: string, description: string): Promise<Task> => {
    /* Send the reqeust to the tasks server */
    const respone = await axios.put(`/${taskId}/description`, description);

    /* Return the response data */
    return respone.data.data as Task;
}

/**
 * 
 * @param {string} taskId The ID of the task
 * @param {string} status The new task status
 * @returns {Promise<Task>} The updated task data
 */
const updateTaskStatus = async (taskId: string, status: string): Promise<Task> => {
    /* Send the reqeust to the tasks server */
    const respone = await axios.put(`/${taskId}/status`, {status});
    console.log(status);
    /* Return the response data */
    return respone.data.data as Task;
}

/**
 * 
 * @param {string} taskId The ID of the task
 * @param {string[]} handlerIds The new task handlers
 * @returns {Promise<Task>} The updated task data
 */
const addTaskHandlers = async (taskId: string, handlerIds: string[]): Promise<Task> => {
    /* Send the reqeust to the tasks server */
    const respone = await axios.put(`/${taskId}/addHandlers`, handlerIds);

    /* Return the response data */
    return respone.data.data as Task;
}

/**
 * 
 * @param {string} taskId The ID of the task
 * @param {string[]} handlerIds The IDs of the handlers to remove from the task
 * @returns {Promise<Task>} The updated task data
 */
const removeTaskHandlers = async (taskId: string, handlerIds: string[]): Promise<Task> => {
    /* Send the reqeust to the tasks server */
    const respone = await axios.put(`/${taskId}/removeHandlers`, handlerIds);

    /* Return the response data */
    return respone.data.data as Task;
}

/**
 * 
 * @param {string} taskId The ID of the task the subtask is part of
 * @param {string} subtaskId The ID of the subtask
 * @param {string} description The new subtask description
 * @returns {Promise<Subtask>} The updated subtask data
 */
const updateSubtaskDescription = async (taskId: string, subtaskId: string, description: string): Promise<Subtask> => {
    /* Send the request to the tasks server */
    const response = await axios.put(`/${taskId}/description/${subtaskId}`, {description});

    /* Return the response data */
    return response.data.data as Subtask;
}

/**
 * 
 * @param {string} taskId The ID of the task the subtask is part of
 * @param {string} subtaskId The ID of the subtask
 * @param {boolean} status The new subtask status
 * @returns {Promise<Subtask>} The updated subtask data
 */
const updateSubtaskStatus = async (taskId: string, subtaskId: string, status: boolean): Promise<Subtask> => {
    /* Send the request to the tasks server */
    console.log(status);
    const response = await axios.put(`/${taskId}/status/${subtaskId}`, {status});

    /* Return the response data */
    return response.data.data as Subtask;
}

/**
 * 
 * @param {string} taskId The ID of the task the subtask is part of
 * @param {string} subtaskId The ID of the subtask
 * @param {string} handlerId The new subtask handler
 * @returns {Promise<Subtask>} The updated subtask data
 */
const updateSubtaskHandler = async (taskId: string, subtaskId: string, handlerId: string): Promise<Subtask> => {
    /* Send the request to the tasks server */
    const response = await axios.put(`/${taskId}/${subtaskId}/handler`, {handlerId});

    /* Return the response data */
    return response.data.data as Subtask;
}

/**
 * 
 * @param {string} taskId The ID of the task the response is part of
 * @param {string} responseId The ID of the response
 * @param {string} message The new text message of the response
 * @returns {Promise<Response>} The updated response data
 */
const updateResponseMessage = async (taskId: string, responseId: string, message: string): Promise<Response> => {
    /* Send the request to the tasks server */
    const response = await axios.put(`/${taskId}/responses/${responseId}`, {message});

    /* Return the response data */
    return response.data.data as Response;
}

/* DELETE requests */

/**
 * 
 * @param {string} taskId The ID of the task to delete
 * @returns {Promise<string>} The success message
 */
const deleteTask = async (taskId: string): Promise<string> => {
    /* Send the request to the tasks server */
    const response = await axios.delete(`/${taskId}`);

    /* Return the response */
    return response.data.data;
}

/**
 * 
 * @param {string} taskId The ID of the task the subtask is part of
 * @param {string} subtaskId The ID of the subtask to delete
 * @returns {Promise<string>} The success message
 */
const deleteSubtask = async (taskId: string, subtaskId: string): Promise<string> => {
    /* Send the request to the tasks server */
    const response = await axios.delete(`/${taskId}/subtasks/${subtaskId}`);

    /* Return the response data */
    return response.data.data;
}

/**
 * 
 * @param {string} taskId The ID of the task
 * @param {Task} task The old task version 
 * @returns {Promise<Task>} The rolled back task data
 */
const taskVerionRollback = async (taskId: string, task: Task): Promise<Task> => {
    /* Send the request to the tasks server */
    const response = await axios.put(`/${taskId}/rollback`, task);

    /* Return the response data */
    return response.data.data;
}

/**
 * 
 * @param {string} taskId The ID of the task the subtask is part of
 * @param {string} subtaskId The ID of the subtask
 * @param {Subtask} subtask The old subtask version
 * @returns {Promise<Subtask>} The rolled back subtask data
 */
const subtaskVersionRollback = async (taskId: string, subtaskId: string, subtask: Subtask): Promise<Subtask> => {
    /* Send the request to the tasks server */
    const response = await axios.put(`/${taskId}/rollback/${subtaskId}`, subtask);

    /* Return the response data */
    return response.data.data;
}

/**
 * 
 * @param {string} taskId The ID of the task the response is part of
 * @param {string} responseId The ID of the response to delete
 * @returns {Promise<string>} The success message
 */
const deleteTaskResponse = async (taskId: string, responseId: string): Promise<string> => {
    /* Send the request to the tasks server */
    const response = await axios.delete(`/${taskId}/responses/${responseId}`);

    /* Return the response data */
    return response.data.data;
}

export {
    createTask,
    createSubtask,
    createTaskResponse,
    getTasks,
    getTaskById,
    getSubtasks,
    getSubtaskById,
    getResponses,
    updateTaskDescription,
    updateTaskStatus,
    addTaskHandlers,
    removeTaskHandlers,
    updateSubtaskDescription,
    updateSubtaskStatus,
    updateSubtaskHandler,
    updateResponseMessage,
    taskVerionRollback,
    subtaskVersionRollback,
    deleteTask,
    deleteSubtask,
    deleteTaskResponse,
}