import React, {useEffect, useState, useContext} from 'react'
import { Notification } from '../utils/interfaces/Notification'
import { UserContext } from '../context/UserProvider'
import { getAuth } from 'firebase/auth'
import { IoMdNotificationsOutline } from "react-icons/io";
import { NotificatioinContainer } from '../components/NotificationComponents/NotificatioinContainer';

export const Notifications = () => {
    const auth = getAuth();
    const { notifications } = useContext(UserContext);

    useEffect(() => {

    }, [notifications]);

    if (!auth.currentUser) {
        return <div>Loading...</div>
    }

    return (
        <div className='w-full pl-10 my-2'>
            <div className='flex'>
                <span className='text-2xl p-1'>
                    <IoMdNotificationsOutline />
                </span>
                <h1 className='text-black font-semibold text-xl'>
                    {auth.currentUser.displayName}'s notifications
                </h1>
            </div>
            
            <NotificatioinContainer 
                notifications={notifications}
            />
        </div>
    )
}
