import React, { useContext, useEffect, useState } from 'react';
import { GroupConversation } from '../../types/Chat';
import { FaInfoCircle } from "react-icons/fa";
import { EditGroupDialog } from './EditGroupDialog';
import { UserContext } from '../../context/UserProvider';

type GroupNavbarType = {
    group: GroupConversation;
};

export const GroupNavbar: React.FC<GroupNavbarType> = ({ group }) => {
    const { messageSocket } = useContext(UserContext);
    const [editDialog, setEditDialog] = useState<boolean>(false);
    const [localGroup, setLocalGroup] = useState<GroupConversation>(group);

    useEffect(() => {
        setLocalGroup(group); 
    }, [group]);

    useEffect(() => {
    if (!messageSocket) return;

    const handleGroupTitleUpdated = (updatedGroup: GroupConversation) => {
        if (updatedGroup.id === localGroup.id) {
            setLocalGroup(prev => ({
                ...prev,
                title: updatedGroup.title
            }));
        }
    };

    const handleGroupPhotoUpdated = (updatedGroup: GroupConversation) => {
        if (updatedGroup.id === localGroup.id) {
            setLocalGroup(prev => ({
                ...prev,
                photoUrl: updatedGroup.photoUrl
            }));
        }
    };

    messageSocket.on("group-title-updated", handleGroupTitleUpdated);
    messageSocket.on("group-photo-updated", handleGroupPhotoUpdated);

    return () => {
        messageSocket.off("group-title-updated", handleGroupTitleUpdated);
        messageSocket.off("group-photo-updated", handleGroupPhotoUpdated);
    };
}, [messageSocket, localGroup.id]);


    const handleEditDialog = (value: boolean) => {
        setEditDialog(value);
    };

    return (
        <nav className="flex justify-between w-full bg-gray-800 text-white py-3 px-6">
            <div className='flex gap-10'>
                <img
                    src={localGroup.photoUrl}
                    alt="group profile"
                    onError={(e) => e.currentTarget.src = `http://localhost:8003${localGroup.photoUrl}`}
                    className="rounded-full w-12 h-12"
                />
                <h1 className="font-semibold mt-3">{localGroup.title}</h1>
            </div>

            <button onClick={() => handleEditDialog(!editDialog)}>
                <FaInfoCircle size={20} />
            </button>

            {editDialog && <EditGroupDialog group={localGroup} onClose={handleEditDialog} />}
        </nav>
    );
};
