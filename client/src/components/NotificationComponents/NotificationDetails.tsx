import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Notification } from '../../utils/interfaces/Notification';
import { getNotification } from '../../api/notifications';
import { getAuth } from 'firebase/auth';
import { UserContext } from '../../context/UserProvider';
import { User } from '../../utils/interfaces/User';
import { updateUserNotification} from "../../api/notifications";

export const NotificationDetails = () => {
    const auth = getAuth();
    const { users } = useContext(UserContext);
    const { userId, notificationId } = useParams<{userId: string, notificationId: string}>();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [sender, setSender] = useState<User | null>(null)

    useEffect(() => {
        if (!auth.currentUser) {
            return;
        }

        if (userId && notificationId) {
            if (auth.currentUser.uid === userId) {
                fetchNotificationData(userId, parseInt(notificationId));
            }
        }
    }, [notificationId])


    const fetchNotificationData = async (userId: string, notificationId: number) => {
        const response = await getNotification(userId, notificationId);

        if (response) {
            if (response.notification.senderId !== 'System') {
                for (let user of users) {
                    
                    if (user.id === response.notification.senderId) {
                        setSender(user);
                        break;
                    }
                }
            }
            setNotification(response.notification);

            if (!response.notification.read) {
                updateNotificationStatus(userId, notificationId);
                console.log('UPDATE CALLED');
            }
        }
    }

    const updateNotificationStatus = async (userId: string, notificationId: number) => {
        const response = await updateUserNotification(userId, notificationId);

        if (response) {
            console.log(response);
        }
    }

    if (!notification) {
        return <div>Loading...</div>
    }

    return (
        <div className='fixed justify-center w-2/3 rounded-lg shadow-xl bg-gray-50 m-10'>
            <div className='block text-start items-start'>
                {
                    sender ? 
                        <div className='flex justify-between'>
                            <img src={sender.photoUrl} alt="sender" className='rounded-full w-8'/>
                            <h1>{sender.displayName}</h1>
                        </div> 
                    : 
                        <h1 className='p-2 text-xl font-bold'>{notification.senderId}</h1>
                }

                <p className='text-lg font-semibold px-2 py-6'>{notification.message}</p>
            </div>
        </div>
    )
}
