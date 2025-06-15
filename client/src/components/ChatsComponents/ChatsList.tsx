import React, { useContext, useEffect, useState } from 'react';
import { getUserConversations } from '../../api/chats';
import { UserContext } from '../../context/UserProvider';
import { ChatConversation, Message } from '../../types/Chat';
import { User } from '../../types/User';
import { getUsersData } from '../../api/users';
import defaultPhoto from "../../Images/default-user-photo.svg";

type ChatsListType = {
    onHandleId: (itemId: string) => void;
};

export const ChatsList: React.FC<ChatsListType> = ({ onHandleId }) => {
    const { user, loading, messageSocket } = useContext(UserContext);
    const [chats, setChats] = useState<ChatConversation[]>([]);
    const [chatUsers, setChatUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUserChats = async () => {
            if (!user) return;

            try {
                const response: ChatConversation[] = await getUserConversations();
                setChats(response);

                const chatMembers = response.map(chat => chat.members.find(member => member !== user.id));
                const uniqueMemberIds = Array.from(new Set(chatMembers.flat().filter(Boolean)));
                if (uniqueMemberIds.length > 0) {
                    fetchConversationUsers(uniqueMemberIds as string[]);
                }
            } catch (error) {
                console.error(error);
            }
        };

        const fetchConversationUsers = async (userIds: string[]) => {
            try {
                const response: User[] = await getUsersData(userIds);
                setChatUsers(response);
            } catch (error) {
                console.error(error);
            }
        };

        if (user) {
            fetchUserChats();
        }
    }, [user]);

    useEffect(() => {
        if (!messageSocket) return;

        const handleNewPrivateMessage = (msg: Message) => {
            setChats(prevChats => {
                const updatedChats = prevChats.map(chat =>
                    chat.id === msg.conversation
                        ? { ...chat, lastMessage: msg.text }
                        : chat
                );

                const updatedChat = updatedChats.find(chat => chat.id === msg.conversation);
                const otherChats = updatedChats.filter(chat => chat.id !== msg.conversation);

                return updatedChat ? [updatedChat, ...otherChats] : updatedChats;
            });
        };

        messageSocket.on("new-conversation-message", handleNewPrivateMessage);
        return () => {
            messageSocket.off("new-conversation-message", handleNewPrivateMessage);
        };
    }, [messageSocket]);

    if (!user || loading) {
        return <>Loading....</>;
    }

    return (
        <aside className="w-1/6 md:w-2/6 lg:max-w-lg bg-gray-800 text-white py-2 px-2 md:px-6">
            {chats.map((chat) => {
                const otherUserId = chat.members.find((id) => id !== user.id);
                const otherUser = chatUsers.find((u) => u.id === otherUserId);

                return (
                    <button
                        key={chat.id}
                        onClick={() => onHandleId(chat.id)}
                        className="flex hover:bg-slate-600 hover:rounded-md w-full gap-4 px-1 lg:px-4 py-2"
                    >
                        <img
                            src={otherUser?.photoUrl ?? defaultPhoto}
                            alt="profile"
                            className="rounded-full w-10 h-10"
                            onError={(e) => e.currentTarget.src = defaultPhoto}
                        />
                        <div className="hidden md:block text-start">
                            <h1 className="font-semibold">
                                {otherUser?.displayName ?? "Unknown"}
                            </h1>
                            <p className="truncate text-sm" title={chat.lastMessage ?? ""}>
                                {chat.lastMessage ?? ""}
                            </p>
                        </div>
                    </button>
                );
            })}
        </aside>
    );
};
