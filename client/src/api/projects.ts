import { PROJECT_END_POINT } from "./endpoint"
import { Project } from "../utils/types/Project"
import axios from "axios"

const getProjects = async () => {
    try {
        const response = await axios.get(`${PROJECT_END_POINT}/`)

        if (!response) {
            //TODO: error check
            return
        }

        return response.data
    } catch (err) {
        console.error(err)
    }
}

const getProjectById = async (id: string | undefined) => {
    if (id === undefined) {
        console.log("Failed to fetch the id of the project")
        return
    }


    try {
        const response = await axios.get(`${PROJECT_END_POINT}/${id}`)

        if (!response) {
            //TODO: error check
            return
        }

        return response.data
    } catch (err) {
        console.error(err)
    }
}

const createProject = async (project: Project) => {
    try {
        const response = await axios.post(`${PROJECT_END_POINT}/`, project)

        if (!response) {
            //Todo: error check
            return
        }

        return response
    } catch (err) {
        console.error(err)
    }
}

const updateProject = async (project: Project, id: string | undefined) => {
    if (id === undefined) {
        console.error("Project id could not be fetched!")
        return
    }

    try {
        console.log(id, project)
        const response = await axios.put(`${PROJECT_END_POINT}/${id}`, project)

        if (!response) {
            // TOD: handle error
            return
        }

        return response.data
    } catch (err) {
        console.error(err)
    }
}



export { getProjects, getProjectById, createProject, updateProject } 