import React, {useContext} from 'react'
import { UserContext } from '../context/UserProvider'
import { IoMdNotificationsOutline } from "react-icons/io";
import { NotificatioinContainer } from '../components/NotificationComponents/NotificatioinContainer';

export const Notifications = () => {
    const { user, loading } = useContext(UserContext);

    

    if (loading || !user) {
        return <div>Loading...</div>
    }

    return (
        <div className='w-full pl-10 my-2 h-screen'>
            <div className='flex'>
                <span className='text-2xl p-1'>
                    <IoMdNotificationsOutline />
                </span>
                <h1 className='text-black font-semibold text-xl'>
                    {user.displayName}'s notifications
                </h1>
            </div>
            
            <NotificatioinContainer 
                limit={10}
            />
        </div>
    )
}
