import React, { useState, useRef } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import Select from 'react-select';
import defaultPhoto from "../../Images/default-user-photo.svg";
import { User } from '../../types/User';
import { createGroupStyles } from '../../utils/Select-Styles';
import { createGroup, uploadGroupFiles } from '../../api/groups';

type CreateGroupDialogType = {
  users: User[];
  onClose: (value: boolean) => void;
};

type UserOption = {
  value: string;
  label: string;
  user: User;
};

export const CreateGroupDialog: React.FC<CreateGroupDialogType> = ({ users, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string>(defaultPhoto);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertDefaultImageToFile = async (): Promise<File> => {
        const res = await fetch(defaultPhoto);
        const blob = await res.blob();
        return new File([blob], 'default-photo.svg', { type: blob.type });
    };

    const userOptions: UserOption[] = users.map(user => ({
        value: user.id,
        label: user.displayName,
        user,
    }));

    const formatOptionLabel = ({ user }: UserOption) => (
        <div className="flex items-center gap-2">
            <img
                src={user.photoUrl || defaultPhoto}
                onError={(e) => e.currentTarget.src = `${defaultPhoto}`}
                alt={user.displayName}
                className="w-6 h-6 rounded-full object-cover"
            />
            <span>{user.displayName}</span>
        </div>
    );

     const handleSubmit = async () => {
        const fileToUse = photoFile || await convertDefaultImageToFile();

        const members = selectedUsers.map(option => option.value);

        try {
            const media = await uploadGroupFiles(fileToUse);

            await createGroup(title, description, members, media.url);
        } catch (error) {
            console.error(error);
            return;
        } finally {
            onClose(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="w-4/5 md:w-3/5 lg:w-2/5 bg-slate-100 p-6 rounded-lg shadow-lg text-black relative">
                <div className="flex w-full justify-end">
                    <IoCloseOutline
                        onClick={() => onClose(false)}
                        className="bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer"
                        size={24}
                    />
                </div>

                {/* Group Photo */}
                <div className="flex flex-col items-center mt-4">
                    <img
                        src={photoPreview}
                        alt="group"
                        className="rounded-full w-40 h-40 object-cover cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                    <p className="text-sm text-gray-500 mt-2">Click the photo to upload</p>
                </div>

                {/* Title */}
                <input
                    type="text"
                    placeholder="Group Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-4 px-4 py-2 border border-slate-400 rounded-md"
                />

                {/* Description */}
                <textarea
                    placeholder="Group Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-3 px-4 py-2 border border-slate-400 rounded-md resize-none"
                    rows={3}
                />

                {/* User Select */}
                <div className="mt-4">
                    <label className="block mb-1 font-semibold">Select Members</label>
                    <Select
                        options={userOptions}
                        value={selectedUsers}
                        onChange={(selected) => setSelectedUsers(selected as UserOption[])}
                        isMulti
                        styles={createGroupStyles}
                        formatOptionLabel={formatOptionLabel}
                        placeholder="Choose users..."
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    className="mt-6 w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition"
                >
                    Create Group
                </button>
            </div>
        </div>
    );
};
