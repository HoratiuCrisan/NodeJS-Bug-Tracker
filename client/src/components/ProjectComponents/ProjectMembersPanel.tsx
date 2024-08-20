import React, {useState} from 'react'
import { User } from '../../utils/interfaces/Project'
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
                    src={mngr.PhotoUrl} 
                    alt="manager"
                     
                    className='rounded-full w-12 h-12'
                />

                <div className='block mx-2'>
                    <h6>{mngr.DisplayName}</h6>
                    <p>{mngr.Email}</p>
                    <div className='flex'>
                        {mngr.Roles.map((role, id) => (
                            <h6 
                                key={id}
                                className='border-2 border-green-700 rounded-md mr-2 px-1'
                            >
                                {role}
                            </h6>
                        ))}
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
                        src={member.PhotoUrl} 
                        alt={`member ${id}`}
                        className='rounded-full w-12 h-12' 
                    />

                    <div className='block mx-2'>
                        <h6>{member.DisplayName}</h6>
                        <p>{member.Email}</p>
                        <div className='flex'>
                        {member.Roles.map((role, id) => (
                            <h6
                                key={id} 
                                className='border-2 border-green-700 rounded-md mr-2 px-1'
                            >
                                {role}
                            </h6>
                        ))}
                    </div>
                    </div>
                </div>
            ))}
        </div>
  )
}
