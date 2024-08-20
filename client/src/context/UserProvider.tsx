import React, { useState, useEffect, createContext, ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { getAuth } from "firebase/auth";
import { User } from "../utils/interfaces/User";
import { getAllUsersForChats } from "../api/messages/users";
import { getUserConversations } from "../api/messages/chats";
import { getUserNotifications } from "../api/notifications";
import { Conversation, Message } from "../utils/interfaces/Chat";
import { Notification } from "../utils/interfaces/Notification";
import { getUserData } from "../api/users";
import { useAxiosInterceptors } from "../hooks/token";

interface UserContextType {
    users: User[];
    conversations: Conversation[];
    notifications: Notification[];
    userRole: string | null;
    loading: boolean;
    sendMessage: (
        conversationId: string,
        senderId: string,
        text: string,
        mediaUrl?: string
    ) => void;
    sendNotification: (
        receiverId: string,
        text: string,
        senderId?: string
    ) => void;
    fetchUserNotifications: (
        userId: string
    ) => void;
}

interface UserProviderProps {
    children: ReactNode;
}

const END_POINT = "http://localhost:8003";
const NOTIFICATION_END_POINT = "http://localhost:8004";

export const UserContext = createContext<UserContextType>({
    users: [],
    notifications: [],
    userRole: null,
    conversations: [],
    loading: true,
    sendMessage: () => {},
    sendNotification: () => {},
    fetchUserNotifications: (userId: string) => {}
});

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    useAxiosInterceptors();
    const userId = getAuth().currentUser?.uid;
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (userId) {
            fetchAllUsers();
            fetchUserConversations();
            fetchUserNotifications(userId);
            fetchUserData(userId);

            const newSocket = io(END_POINT, {
                query: { userId }
            });

            setSocket(newSocket);

            newSocket.on('user-status-changed', () => {
                fetchAllUsers();
            });

            newSocket.on('new-message', (data) => {
                console.log("message uid: ", userId);
                const { conversationId, message } = data;
                updateConversationMessages(conversationId, message);
            });

            const newNotificationSocket = io(NOTIFICATION_END_POINT);
            setNotificationSocket(newNotificationSocket);

            newNotificationSocket.on('new-notification', (data) => {
                console.log("New message notification received: ", data);
                const { receiverId, notification } = data;
                if (receiverId === userId) {
                    setNotifications((prevNotifications => [...prevNotifications, notification]))
                }
            });

            newNotificationSocket.on('notification-status-changed', (data) => {
                const { userId: receiverId, notification } = data;

                if (receiverId === userId) {
                    console.log("Notification status changed: ", notification);
                    fetchUserNotifications(userId);
                }
            });

            newNotificationSocket.on('notification-deleted', (data) => {
                const { userId: receiverId, notificationId } = data;
                fetchUserNotifications(userId);
            });

            newNotificationSocket.on('new-assigned-ticket', (data) => {
                console.log("New ticket assigned! Notification received: ", data);
                fetchUserNotifications(userId);
            });

            return () => {
                newSocket.disconnect();
                newNotificationSocket.disconnect();
            };
        }
    }, [userId]);

    const fetchUserData = async (userId: string) => {
        const response = await getUserData(userId);
        if (response) {
            console.log(response.user.role);
            setUserRole(response.user.role);
        }
        setLoading(false);
    }

    const fetchAllUsers = async () => {
        const users: Array<User> = await getAllUsersForChats();
        if (users) {
            setUsers(users);
        }
    };

    const fetchUserConversations = async () => {
        try {
            const response = await getUserConversations(userId);

            if (!response) {
                return; // handle error
            }

            setConversations(response);
        } catch (error) {
            console.log("Error fetching user conversations: ", error);
        }
    };

    const sendMessage = (conversationId: string, senderId: string, text: string, mediaUrl?: string) => {
        if (socket) {
            socket.emit('send-message', { conversationId, senderId, text, mediaUrl });
        }
    };

    const sendNotification = (receiverId: string, text: string, senderId?: string) => {
        if (notificationSocket) {
            console.log("Notification sender called");
            notificationSocket.emit('new-message-notification', { receiverId, text, senderId });
        }
    };

    const fetchUserNotifications = async (userId: string) => {
        try {
            const response = await getUserNotifications(userId);

            if (response) {
                console.log("notifications: ", response.notifications);
                setNotifications(response.notifications)
            }
        } catch (error) {
            console.error("Error fetching user notifications");
        }
    }

    const updateConversationMessages = (conversationId: string, newMessage: Message) => {
        setConversations(prevConversations =>
            prevConversations.map(conversation =>
                conversation.id === conversationId
                    ? { ...conversation, messages: [...conversation.messages, newMessage] }
                    : conversation
            )
        );
    };

    return (
        <UserContext.Provider value={{
            users,
            conversations,
            notifications,
            userRole,
            loading,
            sendMessage,
            sendNotification,
            fetchUserNotifications
        }}>
            {children}
        </UserContext.Provider>
    );
};
