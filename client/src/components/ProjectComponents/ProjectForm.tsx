import React, { useContext, useEffect, useState } from 'react';
import { Project } from '../../types/Project';
import Select from "react-select";

import { IoExtensionPuzzleOutline } from 'react-icons/io5';
import { TextEditor } from '../TextEditor';
import { User } from '../../types/User';
import { getNonUsers } from '../../api/users';

import defaultPhoto from "../../Images/default-user-photo.svg";
import { UserContext } from '../../context/UserProvider';
import { createProject } from '../../api/projects';

type UserOption = {
    value: string;
    label: string;
    user: User;
};

export const ProjectForm = () => {
    const {user} = useContext(UserContext);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [manager, setManager] = useState<UserOption>();
    const [users, setUsers] = useState<UserOption[]>([]);
    const [members, setMembers] = useState<UserOption[]>([]);
    const [managerOptions, setManagerOptions] = useState<UserOption[]>([]);

    useEffect(() => {
        const fetchNonUsers = async () => {
            try {
                const response: User[] = await getNonUsers();

                 const userOptions: UserOption[] = response.map(user => ({
                    value: user.id,
                    label: user.displayName,
                    user,
                })).filter((u) => u.user.role !== "project-manager");

                setUsers(userOptions);

                const managers: UserOption[] = response.map(user => ({
                    value: user.id,
                    label: user.displayName,
                    user,
                })).filter((u) => u.user.role === "project-manager");

                setManagerOptions(managers);
            } catch (error) {
                console.error(error);
                return;
            }
        }

        if (user) {
            fetchNonUsers();
        }
    }, [user]);

    const handleTitleChange = (value: string) => {
        setTitle(value);
    }

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
    }

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

    const handleSubmitProject = async () => {
        console.log(manager, members)
        if (!manager || members.length === 0) return;
        console.log("here")
        try {
            await createProject(title, description, manager.value, members.map((member) => {return member.value}));

            window.location.href=`/projects`;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    return (
        <div className="ml-6 lg:ml-16 py-4">
            <h1 className='flex text-xl text-gray-800 font-semibold'>
                <IoExtensionPuzzleOutline 
                    className='mr-4 mt-1'
                />
                Create Project
            </h1>

            <div className="w-11/12 mx-auto bg-white rounded-lg shadow-lg h-full my-4 py-4 px-8">
                <label 
                    title="title"
                    className="text-lg font-semibold mb-4"
                >Title: 

                <input 
                    type="text" 
                    name="title" 
                    id="title" 
                    value={title}
                    onChange={(e) => handleTitleChange(e.currentTarget.value)}
                    className="w-full bg-slate-50 border-2 border-gray-400 rounded-md text-black text-md font-normal p-2 mt-4"
                />
                </label>

                <h1 className="my-4 text-lg font-semibold">
                    Description
                </h1>

                <TextEditor 
                    onChange={handleDescriptionChange}
                    value={description}
                    readonly={false}
                    classname='mb-8'
                />

                <label 
                    className='text-lg font-semibold'
                    htmlFor="manager"
                >
                    Manager:

                    <Select 
                        className="mb-8 mt-2"
                        value={manager}
                        options={managerOptions}
                        formatOptionLabel={formatOptionLabel}
                        onChange={(e) => setManager(e as UserOption)}
                    />
                </label>

                <label
                    className="text-lg font-semibold" 
                    htmlFor="Members"
                >
                    Members:

                    <Select 
                        className="mt-2 mb-6"
                        isMulti
                        value={members}
                        options={users}
                        formatOptionLabel={formatOptionLabel}
                        onChange={(selected) => setMembers(selected as UserOption[])}
                    />
                </label>

                <button
                    onClick={handleSubmitProject}
                    className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 text-white hover:text-gray-200 text-md font-semibold py-2 mt-6 mb-2"
                >
                    Submit  
                </button>
            </div>
        </div>
    )
}
