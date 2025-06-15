import { env } from "../utils/evnValidation";
import { getAxiosInstance } from "./axiosInstance";
import { Project, ProjectCardType } from "../types/Project";

const axios = getAxiosInstance(env.REACT_APP_PROJECTS_END_POINT);

const createProject = async (title: string, description: string, projectManagerId: string, memberIds: string[]) => {
    console.log(description)
    const response = await axios.post(`/`, {title, description, projectManagerId, memberIds});

    return response.data.data;
}

const createInvitationLink = async (projectId: string): Promise<string> => {
    const response = await axios.post(`/${projectId}/link`);

    return response.data.data as string;
}

const getUserProjects = async (userId: string): Promise<Project[]> => {
    const response = await axios.get(`/${userId}/user`);

    return response.data.data as Project[];
}

const getProjects = async (): Promise<Project[]> => {
    const response = await axios.get(`/`);
    
    return response.data.data as Project[];
}

const getProjectById = async (projectId: string): Promise<ProjectCardType> => {
    const response = await axios.get(`/${projectId}`);

    return response.data.data as ProjectCardType;
}

const joinProject = async (code: string, expires: number): Promise<Project> => {
    console.log(code, expires);
    const response = await axios.put(`/join?code=${code}&expires=${expires}`);

    return response.data.data as Project;
}

const updateProjectTitle = async (projectId: string, title: string): Promise<Project> => {
    console.log(title);
    const response = await axios.put(`/${projectId}/title`, {title});

    return response.data.data;
}

const updateProjectDescription = async (projectId: string, description: string): Promise<Project> => {
    const response = await axios.put(`/${projectId}/description`, {description});

    return response.data.data;
}

const removeProjectMembers = async (projectId: string, memberIds: string[]): Promise<Project> => {
    const response = await axios.put(`/${projectId}/removeMembers`, {memberIds});
    
    return response.data.data;
}

const deleteProject = async (projectId: string) => {
    const response = await axios.delete(`/${projectId}`);

    return response.data.data;
}
 
export {
    createProject,
    createInvitationLink,
    getProjects,
    getUserProjects,
    getProjectById,
    joinProject,
    updateProjectTitle,
    updateProjectDescription,
    removeProjectMembers,
    deleteProject
}