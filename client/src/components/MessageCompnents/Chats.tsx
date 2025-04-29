import React, {useState, useContext, useEffect} from 'react'
import { ChatsNavbar } from './ChatsNavbar'
import { User } from '../../utils/types/User';
import { Conversation } from './Conversation';
import { getAuth } from 'firebase/auth';
import { UserContext } from '../../context/UserProvider';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { BsFillSendFill } from "react-icons/bs";
import { FaRegImage } from "react-icons/fa6";

interface ChatsProps {
    chat: User | null;
    conversationId: string | null;
}

export const Chats: React.FC<ChatsProps> = ({chat, conversationId}) => {
    const { conversations, sendMessage, sendNotification } = useContext(UserContext);
    //const conversation = conversations.find(conv => conv.id === conversationId);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const auth = getAuth();

    useEffect(() => {

    }, [newMessage])


    if (!chat) {
        return <div>Start a conversation...</div>
    }

    if (!auth.currentUser?.displayName) {
        return <div>Loading</div>
    }

    const handleSendMessage = async () => {
        if (!conversationId) {
            throw new Error("Error! Conversation could not be found!");
        }

        if (newMessage.trim() === '' && !file)
            return;

        const userId = getAuth().currentUser?.uid;

        if (!userId) {
            return; // TODO: handle uid error
        }

        if (file) {
            const fileRef = ref(storage, `messages/${conversationId}/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);
            
            sendMessage(conversationId, userId, newMessage, fileUrl);
            sendNotification(chat.id, newMessage, userId);
        } else {
            sendNotification(chat.id, newMessage, userId);
            sendMessage(conversationId, userId, newMessage);
        }

        setNewMessage('');
        setFile(null);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            console.log(e.target.files)
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className='fixed flex flex-col w-4/6 h-screen text-black bg-white'>
            <ChatsNavbar 
                chat={chat}
            />

            <div className='flex-1 flex flex-col w-full text-black overflow-auto pb-32'>
                {
                    conversationId && 
                    <Conversation 
                        conversationId={conversationId} 
                        participants={[chat.displayName, auth.currentUser.displayName]}
                    />
                }
            </div>

            <div className='fixed flex bottom-0 w-4/6 bg-green-600 justify-center pt-4 pb-2'>
                <div 
                    className='cursor-pointer p-4'
                >
                    <label htmlFor="file-upload">
                        <FaRegImage 
                            className='text-white text-xl cursor-pointer'
                        />
                    </label>
                    <input 
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className='hidden'
                    />
                </div>
                
                <input 
                    placeholder="Type a message..."
                    className='w-5/6 bg-white rounded-md focus:outline-none p-2'
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                    onKeyDown={handleKeyDown}
                />

                <div
                    onClick={handleSendMessage} 
                    className='bg-green-700 rounded-full p-4 mx-4 cursor-pointer'
                >
                    <BsFillSendFill 
                        className='text-white text-xl text-center'
                    />
                </div>
            </div>
        </div>
    )
    
}

