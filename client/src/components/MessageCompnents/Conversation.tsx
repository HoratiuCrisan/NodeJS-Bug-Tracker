import React, {useState, useEffect, useContext, useRef} from 'react';
import { getUserConversations, createConversation } from '../../api/messages/chats';
import { Message } from '../../utils/types/Chat';
import { getAuth } from 'firebase/auth';
import {io} from "socket.io-client"
import '../../styles/Scrollbar.css';
import { Timestamp } from 'firebase/firestore';

interface ConversationProps {
    conversationId: string;
    participants: string[];
}

export const Conversation: React.FC<ConversationProps> = ({conversationId, participants}) => {
    const latestMessageRef = useRef<HTMLDivElement | null>(null);
    const [messages, setMessages] = useState<Message[]>([])
    useEffect(() => {
        const socket = io("http://localhost:8003");
            handleConversation();
            
            socket.on("new-message", (data: any) => {
                const {conversationId: msgConversationId, message} = data;
                if (msgConversationId === conversationId) {
                    setMessages(prevMessages => [...prevMessages, message]);
                }
            });

            return () => {
                socket.disconnect();
            }
    }, [conversationId])

    useEffect(() => {
        if (latestMessageRef.current) {
            latestMessageRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [messages])

    const handleConversation = async () => {
        try {
            const response: Message[] = await getUserConversations(conversationId);

            if (response) {
                setMessages(response);
            }

            if (response === undefined) {
                try {
                    const createConvResponse = await createConversation(conversationId, participants);

                } catch (createError) {
                    console.error(createError);
                }
            } else {
            }
        } catch (error) {
            
        }
    }

    

    if (!conversationId) {
        return <div>Loading conversation...</div>
    }

    return (
        <div className='overflow-y-auto bg-white rounded-md p-4 w-full'>
      {messages.map((msg, id) => (
        <div
          key={id}
          className={`flex ${msg.senderId === getAuth().currentUser?.uid ? 'justify-end' : 'justify-start'} items-start mb-4`}
        >
          <span className={`block max-w-sm lg:max-w-md 2xl:max-w-xl rounded-2xl text-lg px-6 py-1 ${msg.senderId === getAuth().currentUser?.uid ? 'bg-blue-400 text-white self-end' : 'bg-gray-300 text-gray-800 self-start'}`}>
            {msg.text}
          </span>
        </div>
      ))}
      <div ref={latestMessageRef}></div> {/* Empty div to scroll to */}
    </div>
    )
}
