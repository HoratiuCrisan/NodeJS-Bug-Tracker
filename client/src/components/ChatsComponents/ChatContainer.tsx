import React, { useContext, useEffect, useState } from 'react'
import { ChatConversation } from '../../types/Chat';
import { addConversationMessage, getConversation, uploadConversationFile } from '../../api/chats';
import { MessageMedia } from '../../types/Chat';
import MessageInput from './MessageInput';
import { ChatNavbar } from './ChatNavbar';
import { ChatMessages } from './ChatMessages';
import { UserContext } from '../../context/UserProvider';
import backgroundPhoto from "../../Images/backgroud-photo.svg"

type ChatContainerType = {
    chatId: string | null;
}

export const ChatContainer: React.FC<ChatContainerType> = ({chatId}) => {
    const {user, messageSocket} = useContext(UserContext);
    const [chat, setChat] = useState<ChatConversation | undefined>(undefined);

    useEffect(() => {
        const fetchChatData = async (id: string) => {
            try {
                const response: ChatConversation = await getConversation(id);

                setChat(response);
            } catch (error) {
                console.error(error);
                return;
            }
        }

        if (chatId) {
            console.log(chatId)
            fetchChatData(chatId);

            messageSocket?.emit("join", chatId);
        }
    }, [chatId, messageSocket]);

    const handleSend = async (message: string, mediaFiles: File[]) => {
        if (!chatId) return;
        
        try {
            const files: MessageMedia[] = [];

            for (const mediaFile of mediaFiles) {
                const response = await uploadConversationFile(mediaFile);
                files.push(response);
            }

            let chatMessage = message;
            
            if (chatMessage.length === 0) {
                chatMessage = files[files.length - 1].fileName;
            }

            await addConversationMessage(chatId, chatMessage, files);
        } catch (error) {
            console.error(error);
            return;
        } 
    } 

    if (!chatId || !chat) {
        return <></>;
    }

    return (
        <div className="flex flex-col flex-1 h-full w-full bg-gray-100">
            <ChatNavbar chat={chat}/>

            <div className="flex-1 overflow-y-auto p-4">
                <ChatMessages chat={chat}/>
            </div>

            {/* Fixed input */}
            <div className="p-3 bg-white">
                <MessageInput onSend={handleSend}/>
            </div>
        </div>
    )
}
