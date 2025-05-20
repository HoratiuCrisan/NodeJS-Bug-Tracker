import React, {useEffect, useState, useContext} from 'react'
import {getUsersData} from "../../api/users";
import {User} from "../../types/User"
import { UserContext } from '../../context/UserProvider'
import { MessageNavbar } from './MessageNavbar'
import DefaultImage from "../../Images/ProfileImage.jpg"
import { ChatConversation } from '../../types/Chat';
import { getUserConversations } from '../../api/chats';

interface MessageSidebarProps {
    handleSetChat: (value: User | null) => void;
}

export const MessageSidebar: React.FC<MessageSidebarProps> = ({handleSetChat}) => {
    const {user} = useContext(UserContext);

    const [users, setUsers] = useState<User[]>([]);
    const [chats, setChats] = useState<ChatConversation[]>([]);
    const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
    const [dispUsers, setDispUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchChatConversations = async (userId: string) => {
            try {
                const response: ChatConversation[] = await getUserConversations();

                console.log(response);

                setChats(response);

                const chatsMembers: string[][] = response.map((chat) => chat.members);

                const userIds: string[] = [];
                for (let i = 0; i < chatsMembers.length; i++) {
                    for (let usr of chatsMembers[i]) {
                        if (usr !== userId)
                            userIds.push(usr);
                    }
                }

                await fetchUsersData(userIds);
            } catch (error) {
                return;
            }
        };

        if (user) {
            fetchChatConversations(user.id);
        }
    }, []);

    const fetchUsersData = async (userIds: string[]) => {
        try {
            const response: User[] = await getUsersData(userIds);

            setUsers(response);
        } catch (error) {
            return;
        }
    }


    const handleSearchUser = (value: string) => {
        if (value.length === 0) {
            setDisplayedUsers(dispUsers);
        }

        value = value.toLowerCase();
        const filter = dispUsers.filter((user) => {
            return user.displayName.includes(value) || user.email.includes(value); 
        });

        setDisplayedUsers(filter);
    }

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div className="fixed w-2/6 md:w-1/6 top-16 right-0 bg-gray-100 h-full z-20">
            <MessageNavbar
                handleSearchUser={handleSearchUser} 
                user={user} 
            />

            {chats.map((chat, index) => (
                <div 
                    key={index}
                >
                    {chat.id}
                </div>
            ))}
        </div>
    )
}