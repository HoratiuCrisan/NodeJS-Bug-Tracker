import React, {useState, useEffect} from 'react'
import { getAuth } from 'firebase/auth'
import { Chats } from '../components/MessageCompnents/Chats';
import { MessageSidebar } from '../components/MessageCompnents/MessageSidebar';
import axios from 'axios';
import { User } from '../types/User';

export const Messages = () => {
    const [chat, setChat] = useState<User | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const auth = getAuth();

    useEffect(() => {
        if (!auth.currentUser?.uid) {
            throw new Error("Error! Unauthorized action! Please login!");
        }

        if (!chat) {
            return;
        }

        if (auth.currentUser.uid > chat.id) {
            setConversationId(auth.currentUser.uid + chat.id);
        } else {
            setConversationId(chat.id + auth.currentUser.uid);
        }

    }, [chat, auth]);

    const handleSetChat = (value: User | null) => {
        setChat(value);
    }

    return (
        <div className='flex justify-between mx-1'>
            <Chats 
                chat={chat}
                conversationId={conversationId}
            />
            <MessageSidebar 
                handleSetChat={handleSetChat}
            />
        </div>
    )
}
