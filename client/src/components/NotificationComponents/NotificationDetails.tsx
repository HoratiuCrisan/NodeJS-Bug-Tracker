import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom';
import { getNotification, readNotification } from '../../api/notifications';
import { UserContext } from '../../context/UserProvider';
import { ErrorDialog } from '../ErrorDialog';
import { Notification } from '../../types/Notification';
import { FaArrowLeft } from "react-icons/fa";
import dayjs from 'dayjs';

export const NotificationDetails = () => {
    const { loading, user, setUnreadNotifications, setUnreadNotificationCount } = useContext(UserContext);
    const { notificationId } = useParams<{notificationId?: string}>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorDialog, setErrorDialog] = useState<boolean>(false);

    useEffect(() => {
        const fetchNotificationData = async () => {
            try {
                setError(null);
                if (!notificationId) {
                    setError(`Failed to retrieve the ID of the notification message`);
                    setErrorDialog(true);
                    return;
                }

                const notification: Notification = await getNotification(notificationId);

                setNotification(notification);

                if (!notification.read) {
                    updateNotificationStatus(notification.id);
                }
            } catch (error) {
                setError(`Failed to retrieve notification data`);
                setErrorDialog(true);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        if (isLoading) {
            fetchNotificationData();
        }
    }, [notificationId])


    

    const updateNotificationStatus = async (notificationId: string) => {
        try {
            const updatedNotification: Notification = await readNotification(notificationId);

            setNotification(updatedNotification);

            setUnreadNotifications(prev => prev.filter(n => n.id !== updatedNotification.id));
            setUnreadNotificationCount(prev => prev - 1);
        } catch (error) {
            setError(`Failed to view notification`);
            setErrorDialog(true);
            return;
        }
    }

    if (loading || !user || !notification) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <button 
                onClick={() => window.location.href=`/notifications`}
                className="flex gap-2 w-full px-10 pt-6"
            >
                <FaArrowLeft className="mt-1.5"/>
                <span className="text-xl font-bold">
                    Notifications
                </span>
            </button>
            <div className='fixed justify-center w-full md:w-4/5 rounded-lg shadow-2xl bg-white m-2 md:m-10 max-h-64'>
                
                <div className='block text-start items-start p-4'>
                    <div className="flex justify-between gap-2 mb-10">
                        <h1 className="font-semibold text-slate-800">{notification.message}</h1>

                        <h1 
                            className="text-gray-500 font-medium"
                        >
                            {dayjs(notification.timestamp).format("DD MMMM YYYY hh:mm A")}
                        </h1>
                    </div>
                    <button 
                        onClick={() => window.location.href=`/${notification.channel}/${notification.data.id}`}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-md p-2 "
                    >
                        View details
                    </button>
                </div>

                {errorDialog && error && <ErrorDialog text={error} onClose={() => {setErrorDialog(false); setError(null)}}/>}
            </div>
        </div> 
    )
}
