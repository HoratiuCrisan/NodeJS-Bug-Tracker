import React, {
    useState,
    useEffect,
    createContext,
    ReactNode,
    useRef,
} from "react";
import { env } from "../utils/evnValidation";
import {io, Socket} from "socket.io-client";
import { auth } from "../config/firebase";
import { getUserById } from "../api/users";
import { UserContextType } from "../types/Context";
import { User } from "../types/User";
import { useAxiosInterceptors } from "../hooks/token";

type UserProciverProps = {
    children: ReactNode;
}

/* Initialize the User context data */
export const UserContext = createContext<UserContextType>({
    unreadMessageCount: 0,
    unreadNotificationCount: 0,
    user: null,
    loading: true,
});

export const UserProvider: React.FC<UserProciverProps> = ({children}) => {
    useAxiosInterceptors();

    const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
    const [messageSocket, setMessageSocket] = useState<Socket | null>(null);
    const initializedRef = useRef(false);
    
    /* Get the ID of the current user from firebase authentication current user */
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        /* If the ID was not provided, exti */
        if (!userId || initializedRef.current) return;

        initializedRef.current = true;

        const fetchUserData = async () => {
            /* Get the user data */
            try {
                const response: User = await getUserById(userId);

                setUser(response);
            } catch (error) {
                console.error(`Failed to retrieve the usre data`, error);
                setUser(null);
            } finally {
                /* Stop the loading process after retrieving the user data */
                setLoading(false);
            }
        };

        /* Call the method to retrieve the user data */
        fetchUserData();
    
        /* Initialize the chats socket service */
        const newMessageSocket = io(env.REACT_APP_CONVERSATIONS_END_POINT, {query: {userId}});
        setMessageSocket(newMessageSocket);

        /* Initialize the notification socket */
        const newNotificationSocket = io(env.REACT_APP_NOTIFICATIONS_END_POINT);
        setNotificationSocket(newNotificationSocket);

        /* Listen to the `new-notification` event from the notification socket */
        newNotificationSocket.on("new-notification", ({receiverId, notification}) => {
            if (receiverId == userId) {
                /* Increment the number of unread notifications for the current user*/
                setUnreadNotificationCount((prev) => prev + 1);
                
                console.log(notification);
            }
        });

        /* End the sockets connection */
        return () => {
            newMessageSocket.disconnect();
            newNotificationSocket.disconnect();
        };
    }, [userId]);

    /* Return the user context data */
    return (
        <UserContext.Provider
            value={{
                unreadMessageCount,
                unreadNotificationCount,
                user,
                loading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};