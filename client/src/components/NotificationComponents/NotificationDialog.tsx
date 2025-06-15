import React, {useState, useEffect, useContext} from 'react'
import { getUserNotifications } from '../../api/notifications';
import { Notification } from '../../types/Notification'
import { UserContext } from '../../context/UserProvider';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

type NotificationsDialogType = {
    notifications: Notification[];
    onClose: (value: boolean) => void;
}

export const NotificationDialog: React.FC<NotificationsDialogType> = ({notifications, onClose}) => {
    const {loading, user} = useContext(UserContext);
    const navigate = useNavigate();
    const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);

    useEffect(() => {
       setDisplayedNotifications(notifications.slice(0, 5));
    }, [notifications]);

    if (loading || !user) {
        return <div>Loading...</div>
    }

    return (
        <div className='fixed block w-1/5 bg-white text-center shadow-md rounded-md mt-4 right-10 z-50'>
            {displayedNotifications.map((notification, index) => (
                <div
                    key={index} 
                    className='block hover:bg-gray-100 cursor-pointer'
                >
                    <button
                        onClick={() => {window.location.href=`/notifications/${user.id}/${notification.id}`; onClose(false)}}
                        className='text-start items-start py-2 px-4'
                    >
                        {notification.message.charAt(0).toUpperCase() + 
                            notification.message.slice(1, notification.message.length)}
                    </button>
                    
                    <h6 className="justify-start items-start text-start text-xs text-gray-500 p-2">
                        {dayjs(notification.timestamp).format("DD/MM/YY hh:mm A")}
                    </h6>

                    {index !== displayedNotifications.length - 1 && <hr className='w-11/12 border border-gray-500 mx-auto' />}
                </div>
            ))}

            <div
                onClick={() => {navigate(`/notifications`); onClose(false)}} 
                className='my-2 justify-end text-end mx-6'
            >
                <span className='text-blue-600 hover:font-semibold cursor-pointer hover:underline'>View all</span>
            </div>
        </div>
    )
}
