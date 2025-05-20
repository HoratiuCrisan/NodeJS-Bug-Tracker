import React, {useState} from 'react'
import { User } from '../../types/User'
import { IoIosArrowForward } from "react-icons/io"

interface Props {
    members: User[]
    manager: User
    onClose: () => void
    panelState: boolean
}

export const ProjectMembersPanel: React.FC<Props> = ({members, manager, onClose, panelState}) => {
    const [mngr, setMngr] = useState<User>(manager)
    return (
        <div className={`${!panelState ? 'hidden' : 'w-full block bg-gray-100 h-screen  p-4' }`}>
            <IoIosArrowForward 
                onClick={onClose}
                className='border-2 border-gray-800 rounded-md w-10 h-6 hover:bg-gray-800 hover:text-white cursor-pointer mb-4'
            />
            <div className='flex'>
                <img 
                    src={mngr.photoUrl} 
                    alt="manager"
                     
                    className='rounded-full w-12 h-12'
                />

                <div className='block mx-2'>
                    <h6>{mngr.displayName}</h6>
                    <p>{mngr.email}</p>
                    <div className='flex'>
                            <h6 
                                className='border-2 border-green-700 rounded-md mr-2 px-1'
                            >
                                {mngr.role}
                            </h6>
                    </div>
                </div>

                
            </div>

            

            <hr  className='w-full my-2 border border-gray-400'/>

            {members.map((member, id) => (
                <div
                    key={id} 
                    className='flex my-2'
                >
                    <img 
                        src={member.photoUrl} 
                        alt={`member ${id}`}
                        className='rounded-full w-12 h-12' 
                    />

                    <div className='block mx-2'>
                        <h6>{member.displayName}</h6>
                        <p>{member.email}</p>
                        <div className='flex'>
                        
                            <h6
                                className='border-2 border-green-700 rounded-md mr-2 px-1'
                            >
                                {member.role}
                            </h6>
                        
                    </div>
                    </div>
                </div>
            ))}
        </div>
  )
}
