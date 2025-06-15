import React, { useContext, useEffect, useState } from 'react';
import { ChatConversation } from '../../types/Chat';
import { UserContext } from '../../context/UserProvider';
import { getUserById } from '../../api/users';
import { User } from '../../types/User';
import defaultPhoto from "../../Images/default-user-photo.svg";

type ChatNavbarType = {
    chat: ChatConversation;
}

export const ChatNavbar: React.FC<ChatNavbarType> = ({chat}) => {
    const {user, onlineUsers} = useContext(UserContext);
    const [messager, setMessager] = useState<User | undefined>(undefined);
    
    useEffect(() => {
        const fetchMessangerData = async (userId: string) => {
            try {
                const response: User = await  getUserById(userId);
            
                setMessager(response);
            } catch (error) {
                console.error(error);
                return;
            }
        }

        if (user) {
            const usr = chat.members.find((membr) => membr !== user.id);

            if (!usr) return;

            fetchMessangerData(usr);
        }
    }, [chat]);

    useEffect(() => {}, [onlineUsers])

    if (!messager) {
        return <>Loading...</>
    }

    return (
        <div className="flex justify-between w-full bg-gray-800 text-white py-3 px-6">
            <div className="flex gap-10">
                <img 
                    src={messager.photoUrl ?? defaultPhoto} 
                    alt="messager porfile photo" 
                    className="rounded-full w-12 h-12"
                    onError={(e) => e.currentTarget.src=`${defaultPhoto}`}
                />

                <div className="block">
                    <h1 className="font-semibold mt-3">{messager.displayName}</h1>
                    <h6 className=''>{onlineUsers.includes(messager.id) ? "online" : "offline"}</h6>
                </div>
            </div>
        </div>
    )
}
