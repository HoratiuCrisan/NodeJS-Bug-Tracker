import React, { useContext, useEffect, useState } from 'react';
import { GroupConversation, Message } from '../../types/Chat';
import { UserContext } from '../../context/UserProvider';
import { getUserGroups } from '../../api/groups';

type GroupListType = {
    onHandleId: (value: string) => void;
};

export const GroupsList: React.FC<GroupListType> = ({ onHandleId }) => {
    const { user, messageSocket } = useContext(UserContext);
    const [groups, setGroups] = useState<GroupConversation[]>([]);

    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                const response: GroupConversation[] = await getUserGroups();
                setGroups(response);
            } catch (error) {
                console.error(error);
            }
        };

        if (user) {
            fetchUserGroups();
        }
    }, [user]);

    useEffect(() => {
    if (!messageSocket) return;

    const handleNewGroupMessage = (msg: Message) => {
        setGroups(prevGroups => {
            const updatedGroups = prevGroups.map(group => {
                if (group.id === msg.conversation) {
                    return {
                        ...group,
                        lastMessage: msg.text
                    };
                }
                return group;
            });

            const updatedGroup = updatedGroups.find(g => g.id === msg.conversation);
            const otherGroups = updatedGroups.filter(g => g.id !== msg.conversation);

            return updatedGroup ? [updatedGroup, ...otherGroups] : updatedGroups;
        });
    };

    const handleGroupTitleUpdated = (updatedGroup: GroupConversation) => {
        setGroups(prev =>
            prev.map(g => g.id === updatedGroup.id ? { ...g, title: updatedGroup.title } : g)
        );
    };

    const handleGroupPhotoUpdated = (updatedGroup: GroupConversation) => {
        setGroups(prev =>
            prev.map(g => g.id === updatedGroup.id ? { ...g, photoUrl: updatedGroup.photoUrl } : g)
        );
    };

    const handleGroupDescriptionUpdated = (updatedGroup: GroupConversation) => {
        setGroups(prev =>
            prev.map(g => g.id === updatedGroup.id ? { ...g, description: updatedGroup.description } : g)
        );
    };

    messageSocket.on("new-group-message", handleNewGroupMessage);
    messageSocket.on("group-title-updated", handleGroupTitleUpdated);
    messageSocket.on("group-photo-updated", handleGroupPhotoUpdated);
    messageSocket.on("group-description-updated", handleGroupDescriptionUpdated);

    return () => {
        messageSocket.off("new-group-message", handleNewGroupMessage);
        messageSocket.off("group-title-updated", handleGroupTitleUpdated);
        messageSocket.off("group-photo-updated", handleGroupPhotoUpdated);
        messageSocket.off("group-description-updated", handleGroupDescriptionUpdated);
    };
}, [messageSocket]);



    return (
        <div className="w-1/6 md:w-2/6 lg:max-w-lg bg-gray-800 text-white py-2 px-2 md:px-6">
            {groups.map((group) => (
                <button 
                    onClick={() => onHandleId(group.id)}
                    key={group.id}
                    className="flex hover:bg-slate-600 hover:rounded-md w-full gap-4 p-2"
                >   
                    <img 
                        src={group.photoUrl} 
                        alt="group photo"
                        onError={(e) => e.currentTarget.src=`http://localhost:8003${group.photoUrl}`}
                        className="rounded-full w-12 h-12"
                    />
                    <div className="hidden md:block justify-start text-start ">
                        <h1 className="max-w-md font-semibold">{group.title}</h1>
                        <p className="max-w-md truncate text-sm" title={group.lastMessage ?? "last group message"}>
                            {group.lastMessage ?? ""}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
};
