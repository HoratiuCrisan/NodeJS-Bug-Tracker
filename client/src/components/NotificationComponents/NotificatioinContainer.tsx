import React, {useEffect, useState} from 'react'
import { Notification } from '../../utils/types/Notification'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { IoTrashBin } from "react-icons/io5";

interface NotificatioinContainerProps {
    notifications: Notification[]
}

export const NotificatioinContainer: React.FC<NotificatioinContainerProps> = ({notifications}) => {
    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {

    }, [auth])

    if (!auth.currentUser) {
        return <div>Loading...</div>
    }

    return (
        <div className='w-full rounded-lg overflow-y-auto'>
            {notifications.map((notification, id) => (
                <div
                    onClick={() => navigate(`/notifications/${auth.currentUser?.uid}/${id.toString()}`)}
                    key={id} 
                    className='block cursor-pointer'
                >
                    <div className={`flex justify-between w-full ${notification.read ? 'bg-gray-300' : 'bg-gray-100'} py-2`}>
                        <h6>{notification.message}</h6>

                        <span className='text-red-500 text-lg hover:bg-gray-400 hover:rounded-full cursor-pointer p-2 mx-6'>
                            <IoTrashBin 
                            />
                        </span>
                    </div>

                    {id !== notifications.length - 1 &&
                        <hr className='w-full border border-gray-300'/>
                    }
                </div>
            ))}
        </div>
    )
}
