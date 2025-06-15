import React, { useContext, useEffect, useState } from 'react';
import { TbUsersPlus } from "react-icons/tb";
import { User } from '../../types/User';
import { getNonUsers } from '../../api/users';
import defaultPhoto from "../../Images/default-user-photo.svg";
import { UserContext } from '../../context/UserProvider';
import { checkConversation, createConversation } from '../../api/chats';
import { ChatConversation } from '../../types/Chat';
import { CreateGroupDialog } from '../GroupComponents/CreateGroupDialog';

type NewChatType = {
    onHandleId: (id: string) => void;
    handleDirectChat: (value: boolean) => void;
}

export const NewChat: React.FC<NewChatType> = ({onHandleId, handleDirectChat}) => {
    const {user} = useContext(UserContext);
    const [users, setUsers] = useState<User[]>([]);
    const [groupDialog, setGroupDialog] = useState<boolean>(false);

    useEffect(() => {
        const fetchChatUsers = async () => {
            try {
                const response: User[] = await getNonUsers();

                setUsers(response);
            } catch (error) {
                console.error(error);
                return;
            }
        }

        fetchChatUsers();
    }, []);

    const handleConversation = async (receiverId: string) => {
        console.log(receiverId);
        try {
            const conversation = await checkConversation(receiverId);

            if (conversation) {
                onHandleId(conversation.id);
                handleDirectChat(true);
                return;
            }

            try {
                const response: ChatConversation = await createConversation(receiverId);

                onHandleId(response.id);
                handleDirectChat(true);
                return;
            } catch (error) {
                console.error(error);
                return;
            }
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const handlGroupDialog = (value: boolean) => {
        setGroupDialog(value);
    }

    if (!user) return <>Loading...</>

    return (
        <div className="block w-1/6 md:w-2/6 bg-gray-800 text-white py-2 px-2.5 md:px-8">
            <button
                onClick={() => handlGroupDialog(!groupDialog)}
                className="flex gap-4 w-full hover:bg-slate-600 hover:rounded-md p-2"
            >
                <span className="bg-green-500 rounded-full px-3 py-2 text-white">
                    <TbUsersPlus size={20}/>
                </span>
                <h1 className="hidden md:block mt-1">Create group</h1>
            </button>

            <h1 className="w-full p-2 my-1 my-1">
                Contacts: 
            </h1>

            <ul className="mt-2">
                {users.map((usr) => usr.id !== user.id && (
                    <button
                        onClick={() => handleConversation(usr.id)}
                        className="flex gap-4 w-full hover:bg-slate-600 hover:rounded-md p-2"
                    >
                        <img 
                            src={usr.photoUrl ?? defaultPhoto} 
                            alt="profile photo" 
                            className="rounded-full w-10 h-10"
                            onError={(e) => e.currentTarget.src=`${defaultPhoto}`}
                        />

                        <h1 className="hidden md:block">{usr.displayName}</h1>
                    </button>
                ))}
            </ul>

            {groupDialog && <CreateGroupDialog onClose={handlGroupDialog} users={users.filter((usr) => usr.id !== user.id)}/>}
        </div>
    )
}
