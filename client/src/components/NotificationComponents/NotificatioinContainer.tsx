import React, { useContext, useEffect, useState } from 'react';
import { Notification } from '../../types/Notification';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserProvider';
import { getUserNotifications } from '../../api/notifications';
import { ErrorDialog } from '../ErrorDialog';
import dayjs from 'dayjs';

type NotificatioinContainerType = {
    limit: number;
};

export const NotificatioinContainer: React.FC<NotificatioinContainerType> = ({ limit }) => {
    const { loading, user } = useContext(UserContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [errorDialog, setErrorDialog] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const fetchUserNotifications = async () => {
        try {
            setIsLoading(true);
            const response: Notification[] = await getUserNotifications(limit, startAfter);
            if (response.length < limit) setHasMore(false);

            setNotifications((prev) => [...prev, ...response]);
            if (response.length > 0) {
                setStartAfter(response[response.length - 1].id);
            }
        } catch (error) {
            setError('Failed to retrieve notifications');
            setErrorDialog(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchUserNotifications();
        }
    }, [loading, user]);

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    return (
        <div className='w-11/12 bg-white rounded-lg p-4'>
            <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 text-left">Message</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {notifications.map((notification) => (
                        <tr 
                            key={notification.id}
                            className={`cursor-pointer ${notification.read ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50`}
                            onClick={() => navigate(`/notifications/${user.id}/${notification.id}`)}
                        >
                            <td className="border border-gray-300 px-4 py-2">{notification.message}</td>
                            <td className="border border-gray-300 text-gray-700 font-medium px-4 py-2">{dayjs(notification.timestamp).format("DD MMMM YY hh:mm A")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {hasMore && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={fetchUserNotifications}
                        disabled={isLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-greeb-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Loading...' : 'View more'}
                    </button>
                </div>
            )}

            {errorDialog && error && (
                <ErrorDialog text={error} onClose={() => { setErrorDialog(false); setError(null); }} />
            )}
        </div>
    );
};
