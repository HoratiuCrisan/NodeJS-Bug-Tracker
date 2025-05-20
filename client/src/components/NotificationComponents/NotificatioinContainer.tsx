import React, {useContext, useEffect, useState} from 'react'
import { Notification } from '../../types/Notification'
import { useNavigate } from 'react-router-dom'
import { IoTrashBin } from "react-icons/io5";
import { UserContext } from '../../context/UserProvider';
import { getUserNotifications } from '../../api/notifications';
import { ErrorDialog } from '../ErrorDialog';

type NotificatioinContainerType = {
    limit: number;
}

export const NotificatioinContainer: React.FC<NotificatioinContainerType> = ({limit}) => {
    const { loading, user } = useContext(UserContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [errorDialog, setErrorDialog] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserNotifications = async () => {
            try {
                /* Send the request to the server */
                const response: Notification[] = await getUserNotifications(limit, startAfter);

                /* Set the current notifications */
                setNotifications(response);

                /* Set the ID of the last notification retrieved */
                setStartAfter(notifications[notifications.length - 1].id);
            } catch (error) {
                setError(`Failed to retrieve notifications`);
                setErrorDialog(true);
                return;
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoading) {
            fetchUserNotifications();
        }
    }, []);

    if (loading || !user) {
        return <div>Loading...</div>
    }

    return (
        <div className='w-full rounded-lg overflow-y-auto'>
            {notifications.map((notification, index) => (
                <div
                    onClick={() => navigate(`/notifications/${user.id}/${notification.id}`)}
                    key={index} 
                    className='block cursor-pointer'
                >
                    <div className={`flex justify-between w-full ${notification.read ? 'bg-gray-300' : 'bg-gray-100'} py-2`}>
                        <h6>{notification.message}</h6>

                        <span className='text-red-500 text-lg hover:text-red-800 cursor-pointer p-2 mx-6'>
                            <IoTrashBin 
                                aria-label="Delte notification dialog"
                                role="button"
                                tabIndex={index}
                            />
                        </span>
                    </div>

                    {index !== notifications.length - 1 &&
                        <hr className='w-full border border-gray-300'/>
                    }
                </div>
            ))}

            {errorDialog && error && <ErrorDialog text={error} onClose={() => {setErrorDialog(false); setError(null)}}/>}
        </div>
    )
}
