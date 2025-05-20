import React, {useState, useEffect, useRef, useContext} from 'react'
import { IoExtensionPuzzleOutline } from "react-icons/io5"
import { useNavigate } from 'react-router-dom'
import { getProjects } from '../api/projects'
import { Project } from '../types/Project'
import { ProjectCard } from '../components/ProjectComponents/ProjectCard'
import { UserContext } from '../context/UserProvider'

export const Projects = () => {
  const navigate = useNavigate()
  const isDataFetched = useRef<boolean>(false)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetchProjects()
  }, [isDataFetched])


  const fetchProjects = async () => {
    const response = await getProjects()

    if (!response) {
      return
    }

    setProjects(response)
    isDataFetched.current = true
  }


  
  return (
    <>
      <div className='flex justify-between mt-4 lg:pl-10'>
        <h1 className='flex text-xl text-gray-800 font-semibold'>
          <IoExtensionPuzzleOutline 
            className='mr-4 mt-1'
          />
          Projects
        </h1>

        <button 
          onClick={() => navigate('/create-project')}
          className='bg-green-600 rounded-md text-lg text-white hover:bg-green-700 mx-4 py-1 px-2'
        >
          Add Project
        </button>
      </div>

      <div className='flex justify-between my-4 lg:pl-8'>
        {projects.map((project, id) => (
          <div 
            key={id}
            className='flex justify-between w-2/4 cursor-pointer my-2'
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <ProjectCard 
              data={project}
            />  
          </div>
        ))}
      </div>
    </>
  )
}
