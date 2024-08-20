import React from 'react'
import { Project } from '../../utils/interfaces/Project'

interface Props {
  data: Project
}

export const ProjectCard: React.FC<Props> = ({data}) => {
  return (
    <div className='w-4/5 bg-gray-100 shadow-xl rounded-md hover:bg-gray-200 p-4'>
      <h1>{data.Title}</h1>
      <div className='flex my-2'>
        <img 
          src={data.ProjectManager.PhotoUrl} 
          alt="manager" 
          className='rounded-full w-8'
        />
        {data.Members.map((member) => (
          <img 
            src={member.PhotoUrl} 
            alt="member" 
            className='rounded-full w-8 mx-2'
          />
        ))}
      </div>
    </div>
  )
}
