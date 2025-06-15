import React, {useEffect, useContext, useState} from 'react'
import { getGroupData, addGroupMessage, uploadGroupFiles } from '../../api/groups'
import { GroupConversation, Message, MessageMedia } from '../../types/Chat';
import MessageInput from '../ChatsComponents/MessageInput';
import { GroupNavbar } from './GroupNavbar';
import { GroupMessages } from './GroupMessages';
import { UserContext } from '../../context/UserProvider';
import backgroundPhoto from "../../Images/backgroud-photo.svg";

type GroupContainerType = {
    groupId: string | null;
}

export const GroupContainer: React.FC<GroupContainerType> = ({groupId}) => {
    const { messageSocket } = useContext(UserContext);
    const [group, setGroup] = useState<GroupConversation | undefined>(undefined);

    const handleSend = async (message: string, mediaFiles: File[]) => {
        if (!groupId) return;
        
        try {
            const files: MessageMedia[] = [];

            for (const mediaFile of mediaFiles) {
                const response = await uploadGroupFiles(mediaFile);
                files.push(response);
            }

            let textMessage = files[files.length - 1].fileName;

            if (message.length > 0) textMessage = message;

            await addGroupMessage(groupId, textMessage, files);
        } catch (error) {
            console.error(error);
            return;
        } 
    } 

    useEffect(() => {
        const fetchGroupData = async (id: string) => {
            try {
                const response: GroupConversation = await getGroupData(id);

                setGroup(response);
            } catch (error) {
                console.error(error);
                return
            }
        }

        if (groupId) {
            fetchGroupData(groupId)

            messageSocket?.emit("join-room", groupId);
        }
    }, [groupId, messageSocket]);
    
    if (!group) {
        return <></>;
    }

    return (
    <div className="flex flex-col flex-1 h-full w-full bg-gray-100">
      {/* Top group navbar */}
      <GroupNavbar group={group} />

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <GroupMessages group={group}/>
      </div>

      {/* Fixed input */}
      <div className="p-3 bg-white">
        <MessageInput onSend={handleSend}/>
      </div>
    </div>
  );
}
