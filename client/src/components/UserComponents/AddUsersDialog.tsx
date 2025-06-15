import React, { useEffect, useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { getUsers } from '../../api/users';
import { User } from '../../types/User';
import defaultPhoto from "../../Images/default-user-photo.svg";
import { addMembers } from '../../api/groups';

type AddUsersDialogType = {
    groupId: string;
    existingUsers: string[];
    onClose: (value: boolean) => void;
    handleNewMembers: (newUserIds: string[]) => void;
};

export const AddUsersDialog: React.FC<AddUsersDialogType> = ({groupId, existingUsers, onClose, handleNewMembers}) => {
    const [newUsers, setNewUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response: User[] = await getUsers("displayName", "asc", 10);
                setNewUsers(response);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsers();
    }, [existingUsers]);

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = async () => {
        try {
            const response = await addMembers(groupId, selectedUsers);
            
            handleNewMembers(selectedUsers);
            onClose(false);
        } catch (error) {
            console.error(error);
            return;
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="w-4/5 md:w-3/5 lg:w-2/6 bg-white p-6 rounded-lg shadow-lg text-black relative">
                {/* Close Button */}
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
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-5 h-5 accent-green-600 cursor-pointer"
                    />
                    </li>
                ))}
                </ul>

                {selectedUsers.length > 0 && (
                <div className="flex justify-end mt-6">
                    <button
                    onClick={handleSave}
                    className="rounded-md bg-green-600 hover:bg-green-700 text-white py-2 px-5"
                    >
                    Save
                    </button>
                </div>
                )}
            </div>
        </div>
    );
};
