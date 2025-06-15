import React, {useContext, useEffect, useState} from 'react';
import { UserContext } from '../context/UserProvider';

import { FaUserAlt, FaAddressBook, FaUsers } from "react-icons/fa";
import { ChatsList } from '../components/ChatsComponents/ChatsList';
import { GroupsList } from '../components/GroupComponents/GroupsList';
import { GroupContainer } from '../components/GroupComponents/GroupContainer';
import { ChatContainer } from '../components/ChatsComponents/ChatContainer';
import { NewChat } from '../components/ChatsComponents/NewChat';

export const Messages = () => {
    const {loading, user} = useContext(UserContext);
    const [itemId, setItemId] = useState<string | null>(null);
    const [userGroups, setUserGroups] = useState<boolean>(false);
	const [userDirectMessages, setUserDirectMessages] = useState<boolean>(true);
	const [newChat, setNewChat] = useState<boolean>(false);

	useEffect(() => {}, [itemId]);

    const handleItemId = (value: string) => {
        setItemId(value);
    }

	const handleUserGroups = (value: boolean) => {
		if (value) {
			setUserGroups(value);
			setUserDirectMessages(!value);
			setNewChat(!value);
		} else {
			setUserGroups(false);
			setUserDirectMessages(true);
			setNewChat(false);
		}
	}

	const handleUserDirectMessages = (value: boolean) => {
		if (value) {
			setUserDirectMessages(value);
			setUserGroups(!value);
			setNewChat(!value);
		} else {
			setUserDirectMessages(false);
			setUserGroups(true);
			setNewChat(false);
		}
	}

	const handleNewChat = (value: boolean) => {
		if (value) {
			setNewChat(value);
			setUserGroups(!value);
			setUserDirectMessages(!value);
		} else {
			setNewChat(false);
			setUserGroups(false);
			setUserDirectMessages(true);
		}
	}


    if (loading || !user) {
        return <>Loading...</>
    }

    return (
    <div className="flex flex-col h-full w-full">
        
      <div className="flex justify-between bg-green-700 py-4 px-4 md:px-8 text-black font-semibold text-lg ">
        <div className="flex gap-4">
			<button
				onClick={() => handleUserDirectMessages(!userDirectMessages)}
				className={`flex gap-2 ${userDirectMessages ? `text-white` : `text-black`}`}
			>
				<FaUserAlt className='mt-1'/> Direct messages 
			</button>
			<button
				onClick={() => handleUserGroups(!userGroups)} 
				className={`flex gap-2 ${userGroups ? `text-white`: `text-black`}`}
			>
				<FaUsers className='mt-1'/>Groups
			</button>
		</div>

		<button
			onClick={() => handleNewChat(!newChat)}
			className={`${newChat ? `text-white` : `text-black`}`}
		>
			<FaAddressBook size={20}/>
		</button>
      </div>

		{userDirectMessages && 
			<div className="flex flex-1 overflow-hidden">
				<ChatsList onHandleId={handleItemId}/>
				{itemId && <ChatContainer chatId={itemId} />}
			</div>
		}

      	{userGroups && 
			<div className="flex flex-1 overflow-hidden">
				<GroupsList onHandleId={handleItemId} />
				{itemId && <GroupContainer groupId={itemId} />}
			</div>
		}

		{newChat && 
			<div className="flex flex-1 overflow-y-auto">
				<NewChat onHandleId={handleItemId} handleDirectChat={handleUserDirectMessages}/>
			</div>
		}
    </div>
  );

}
