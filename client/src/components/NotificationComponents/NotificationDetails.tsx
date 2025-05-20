import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom';
import { getNotification, readNotification } from '../../api/notifications';
import { UserContext } from '../../context/UserProvider';
import { ErrorDialog } from '../ErrorDialog';
import { Notification } from '../../types/Notification';

export const NotificationDetails = () => {
    const { loading, user } = useContext(UserContext);
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
            const notification: Notification = await readNotification(notificationId);

            setNotification(notification);
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
        <div className='fixed justify-center w-5/6 rounded-lg shadow-xl bg-gray-50 m-10 h-screen'>
            <div className='block text-start items-start'>
                

                {JSON.stringify(notification?.data)}
            </div>

            {errorDialog && error && <ErrorDialog text={error} onClose={() => {setErrorDialog(false); setError(null)}}/>}
        </div>
    )
}
