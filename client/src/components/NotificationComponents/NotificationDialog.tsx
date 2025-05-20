import React, {useState, useEffect, useContext} from 'react'
import { getUserNotifications } from '../../api/notifications';
import { Notification } from '../../types/Notification'
import { UserContext } from '../../context/UserProvider';
import { useNavigate } from 'react-router-dom';

export const NotificationDialog = () => {
    const {loading, user} = useContext(UserContext);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const navigate = useNavigate();
    const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);

    useEffect(() => {
       setDisplayedNotifications(notifications.reverse().filter(notification => !notification.read).slice(0, 5));
    }, [notifications]);

    const convertToDate = (timestamp: any) => {
        if (timestamp instanceof Date) {
            return timestamp;
        } else if (typeof timestamp === 'string') {
            return new Date(timestamp);
        } else if (timestamp && timestamp.toDate) { // Firestore Timestamp object
            return timestamp.toDate();
        } else {
            return new Date();
        }
    };

    if (loading || !user) {
        return <div>Loading...</div>
    }

    return (
        <div className='fixed block w-1/5 bg-white text-center shadow-md rounded-md mt-4 right-10 z-50'>
            {displayedNotifications.map((notification, id) => (
                <div
                    key={id} 
                    className='block'
                >
                    <div
                        className='hover:bg-gray-100 cursor-pointer py-2'
                        key={id}
                    >
                        {notification.message.charAt(0).toUpperCase() + 
                            notification.message.slice(1, notification.message.length)
                        }
                    </div>

                    <hr className='w-11/12 border border-gray-500 mx-auto' />

                    
                </div>
            ))}

            <div
                onClick={() => navigate("/notifications")} 
                className='my-2 justify-end text-end mx-6'
            >
                <span className='text-blue-600 hover:font-semibold cursor-pointer hover:underline'>View all</span>
            </div>
        </div>
    )
}
