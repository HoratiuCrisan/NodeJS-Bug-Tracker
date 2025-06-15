import React, { useState, useEffect } from 'react';
import { getNonUsers } from '../../api/users';
import { User } from '../../types/User';
import { IoCloseOutline } from 'react-icons/io5';
import { MdContentCopy } from "react-icons/md";
import defaultPhoto from "../../Images/default-user-photo.svg";
import { ProjectCard } from './ProjectCard';

type InviteUsersDialogType = {
    projectId: string;
    projectTitle: string;
    existingUsers: string[];
    onClose: (value: boolean) => void;
    invitationLink: string;
}

export const InviteUsersDialog: React.FC<InviteUsersDialogType> = ({projectId, projectTitle, onClose, existingUsers, invitationLink}) => {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [newUsers, setNewUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response: User[] = await getNonUsers();
                setNewUsers(response);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsers();
    }, [existingUsers, projectId]);

    const toggleUserSelection = (userEmail: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userEmail)
                ? prev.filter((email) => email !== userEmail)
                : [...prev, userEmail]
        );
    };

    const handleCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            console.log('Copied to clipboard:', content);
        } catch (error) {
            console.error('Unable to copy to clipboard:', error);
        }
    }
    
    const handleInvite = async () => {
        const to = selectedUsers.join(',');
        const subject = encodeURIComponent("You're invited to join a new project!");
        const body = encodeURIComponent(`Hi,\n\nYou've been invited to join the project: "${projectTitle}" .\n\nClick the link below to join:\n${invitationLink}\n\nThanks!`);

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;

        window.open(gmailUrl, '_blank');
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="w-4/5 md:w-3/5 lg:w-2/5 bg-white p-6 rounded-lg shadow-lg text-black relative">
                <div className="flex justify-end mb-4">
                <IoCloseOutline
                    onClick={() => onClose(false)}
                    className="bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer"
                    size={24}
                />
                </div>

                <h1 className="text-xl font-semibold mb-4">Select Users to Add</h1>

                <ul className="max-h-full overflow-y-auto divide-y divide-gray-200">
                {newUsers.map((user) => !existingUsers.includes(user.id) && (
                    <li key={user.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.photoUrl ?? defaultPhoto}
                            alt="profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{user.displayName}</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.email)}
                        onChange={() => toggleUserSelection(user.email)}
                        className="w-5 h-5 accent-green-600 cursor-pointer"
                    />
                    </li>
                ))}
                </ul>

                <button
                    onClick={() => handleCopy(invitationLink)} 
                    className='flex justify-between bg-slate-200 w-full text-md text-blue-900 font-medium rounded-md p-2 my-4'
                >
                    <h1>{invitationLink}</h1>
                    <span
                        title="copy link"
                        className='mt-1'
                    >
                        <MdContentCopy />
                    </span>
                </button>

                {selectedUsers.length > 0 && (
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleInvite}
                        className="rounded-md bg-green-600 hover:bg-green-700 text-white py-2 px-5"
                    >
                        Invite
                    </button>
                </div>
                )}
            </div>
        </div>
    )
}
