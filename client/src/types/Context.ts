import { User } from "./User";

export type UserContextType = {
    unreadMessageCount: number;
    unreadNotificationCount: number;
    user: User | null;
    loading: boolean;
}