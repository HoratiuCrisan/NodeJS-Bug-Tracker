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
import { getUserById, updateStatus } from "../api/users";
import { UserContextType } from "../types/Context";
import { User } from "../types/User";
import { useAxiosInterceptors } from "../hooks/token";
import { getUnreadNotifications } from "../api/notifications";
import { Notification } from "../types/Notification";

type UserProciverProps = {
    children: ReactNode;
}

/* Initialize the User context data */
export const UserContext = createContext<UserContextType>({
    unreadMessageCount: 0,
    unreadNotificationCount: 0,
    onlineUsers: [],
    user: null,
    loading: true,
    messageSocket: null,
    notificationSocket: null,
    userSocket: null,
    unreadNotifications: [],
    setUnreadNotifications: () => {},
    setUnreadNotificationCount: () => {},
});

export const UserProvider: React.FC<UserProciverProps> = ({children}) => {
    useAxiosInterceptors();

    const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
    const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
    const [messageSocket, setMessageSocket] = useState<Socket | null>(null);
    const [userSocket, setUserSocket] = useState<Socket | null>(null);
    const initializedRef = useRef(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    
    /* Get the ID of the current user from firebase authentication current user */
    const userId = auth.currentUser?.uid;

    const fetchUnreadNotifications = async () => {
        try {
            const response: Notification[] = await getUnreadNotifications();

            setUnreadNotifications(response);
            setUnreadNotificationCount(response.length);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const updateUserStatus = async (status: "online" | "offline") => {
        console.log("here")
        try {
            await updateStatus(status);
        } catch (error) {
            console.error(error);
            return;
        }
    } 

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
        fetchUnreadNotifications();
        updateUserStatus("online");

        const newUserSocket = io("http://localhost:8002", {
            withCredentials: true,
        });
        newUserSocket.emit("join", userId);
        setUserSocket(newUserSocket);
    
        /* Initialize the chats socket service */
        const newMessageSocket = io("http://localhost:8003");
        newMessageSocket.emit("join", userId);
        setMessageSocket(newMessageSocket);

        /* Initialize the notification socket */
        const newNotificationSocket = io("http://localhost:8004");
        newNotificationSocket.emit("join", userId);
        setNotificationSocket(newNotificationSocket);

        /* Listen to the `new-notification` event from the notification socket */
        newNotificationSocket.on("new-notification", ({receiverId, notification}) => {
            if (receiverId == userId) {
                /* Increment the number of unread notifications for the current user*/
                setUnreadNotificationCount((prev) => prev + 1);
                setUnreadNotifications((prev) => [notification, ...prev]);

                console.log(notification);
            }
        });

        newMessageSocket.on("new-group-message", ({roomId, message}) => {
            setUnreadMessageCount((prev) => prev + 1);
        });

        newMessageSocket.on("new-conversation-message", ({roomId, message}) => {
            if (roomId === userId)
                setUnreadMessageCount((prev) => prev + 1);
        });

        newMessageSocket.on("conversation-messages-viewed", ({roomId, message}) => {
            if (roomId === userId)
                setUnreadMessageCount((prev) => prev - 1);
        })
        
        newUserSocket.on("user-status-change", ({userId, status}) => {
            if (status === "online") {
                setOnlineUsers((prev) => [userId, ...prev]);
            } else {
                setOnlineUsers((prev) => prev.filter((u) => u !== userId));
            }
        });

        /* End the sockets connection */
        return () => {
            newMessageSocket.disconnect();
            newNotificationSocket.disconnect();
            newUserSocket.disconnect();
        };
    }, [userId]);

    /* Return the user context data */
    return (
        <UserContext.Provider
            value={{
                unreadMessageCount,
                unreadNotificationCount,
                onlineUsers,
                user,
                loading,
                messageSocket,
                notificationSocket,
                userSocket,
                unreadNotifications,
                setUnreadNotifications,
                setUnreadNotificationCount,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};