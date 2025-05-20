import React from 'react'
import { User } from '../../types/User'

interface MessageNavbarProps {
    handleSearchUser: (value: string) => void
    user: User
}

export const MessageNavbar: React.FC<MessageNavbarProps> = ({user, handleSearchUser}) => {
    return (
        <div className='bg-green-600 text-white font-semibold py-2 px-2'>
            <span className='text-lg'>{user.displayName}</span>
            
            <div className='w-full'>
                <input 
                    id="user"
                    placeholder='Search a user...'
                    onChange={(e) => handleSearchUser(e.target.value)}
                    className='w-full rounded-md text-gray-800 focus:outline-none px-2 py-1 my-2'
                />
            </div>
        </div>
    )
}
