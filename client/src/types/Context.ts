import { Socket } from "socket.io-client";
import { User } from "./User";
import { Notification } from "./Notification";

export type UserContextType = {
    unreadMessageCount: number;
    unreadNotificationCount: number;
    onlineUsers: string[];
    user: User | null;
    loading: boolean;
    messageSocket: null | Socket;
    notificationSocket: null | Socket;
    userSocket: null | Socket;
    unreadNotifications: Notification[];
    setUnreadNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    setUnreadNotificationCount: React.Dispatch<React.SetStateAction<number>>;
}