import React, { useEffect, useState } from 'react';

import { Project } from '../../types/Project';
import { User } from '../../types/User';
import { TextEditor } from '../TextEditor';


import { IoCloseOutline } from 'react-icons/io5';
import { IoIosRemoveCircle } from "react-icons/io";

import defaultPhoto from "../../Images/default-user-photo.svg";
import { removeProjectMembers, updateProjectDescription, updateProjectTitle } from '../../api/projects';

type EditProjectDialogType = {
    onClose: (value: boolean) => void;
    project: Project;
    manager: User | undefined;
    members: User[];
}

export const EditProjectDialog: React.FC<EditProjectDialogType> = ({onClose, project, manager, members}) => {
    const [title, setTitle] = useState<string>(project.title);
    const [descripiton, setDescription] = useState<string>(project.description);
    const [displayedMembers, setDisplayedMembers] = useState<User[]>(members);
    const [removedMembers, setRemovedMembers] = useState<User[]>([]);
    
    useEffect(() => {}, [project.id, manager?.id]);

    const handleTitleChange = (value: string) => {
        setTitle(value);
    }

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
    }

    const handleDisplayedMembers = (value: User) => {
        setDisplayedMembers(displayedMembers.filter((member) => member.id !== value.id));
        setRemovedMembers((prev) => [value, ...prev]);
    }

    const handleRevertMember = () => {
        if (removedMembers.length === 0) return;

        const [lastRemoved, ...rest] = removedMembers;

        setRemovedMembers(rest);
        setDisplayedMembers((prev) => [...prev, lastRemoved]);
    }

    const handleTitleUpdate = async () => {
        if (title === project.title || title.length < 10) return;

        try {
            await updateProjectTitle(project.id, title);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const handleDescriptionUpdate = async () => {
        if (descripiton === project.description || descripiton.length < 10) return;

        try {
            await updateProjectDescription(project.id, descripiton);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const handleUpdateMembers = async () => {
        if (removedMembers.length <= 0) return;

        try {
            await removeProjectMembers(project.id, removedMembers.map((removedMember) => {return removedMember.id}));
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const handleUpdateProject = async () => {
        try {
            await Promise.all([
                handleTitleUpdate(),
                handleDescriptionUpdate(),
                handleUpdateMembers()   ,
            ]);

            onClose(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            return;
        }
    }

    return (
        <div className='fixed flex inset-0 items-center justify-center bg-gray-800 bg-opacity-50 overflow-y-auto'>
            <div className='w-full md:w-5/6 lg:w-3/6 bg-gray-50 p-4 rounded-lg shadow-lg max-h-[600px] overflow-y-auto'>
                <div className='block justify-center w-full bg-gray-50 mx-auto'>
                    <div className='flex w-full justify-end items-end text-end md:mt-28 lg:mt-0'>
                        <IoCloseOutline 
                            onClick={() => onClose(false)}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            size={24}
                        />
                    </div>

                    <label 
                        htmlFor="title"
                        className="text-lg font-medium"
                    >
                        Title:
                        <input 
                            type="text" 
                            name="title" 
                            id="title" 
                            value={title} 
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="flex flex-col w-full text-md font-normal border-2 border-gray-400 rounded-md p-1 my-4"
                        />
                    </label>

                    <label 
                        htmlFor="description"
                        className="text-lg font-medium"
                    >
                        Description:
                        <TextEditor 
                            value={descripiton}
                            onChange={handleDescriptionChange}
                            readonly={false}
                            classname="my-4"
                        />
                    </label>

                    {displayedMembers.length > 0 && 
                        <>
                            <h1 className="text-lg font-medium my-4">Members:</h1>

                            <ul className="flex flex-col bg-slate-200 rounded-lg p-2">
                                {displayedMembers.map((displayedMember) => (
                                    <li 
                                        key={displayedMember.id}
                                        className="flex justify-between"
                                    >   
                                        <div className="flex gap-2 p-2">
                                            <img 
                                                src={displayedMember.photoUrl ?? defaultPhoto} 
                                                alt="member profile"
                                                onError={(e) => e.currentTarget.src=`${defaultPhoto}`}
                                                className="rounded-full w-10 h-10" 
                                            />
                                            <h1 className="font-semibold mt-1.5 px-2">{displayedMember.email}</h1>
                                        </div>

                                        <button 
                                            onClick={() => handleDisplayedMembers(displayedMember)}
                                            className="w-10"
                                        >
                                            <IoIosRemoveCircle 
                                                size={25}
                                                className='text-red-500 hover:text-red-600'
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    }

                    {removedMembers.length > 0 && 
                                    <div className="flex start-end mt-4">
                                        <button
                                            onClick={() => handleRevertMember()}
                                            className="bg-red-500 hover:bg-red-700 text-white rounded-md font-medium p-2"
                                        >
                                            Revert
                                        </button>
                                    </div>
                                }

                    <div
                        className="flex justify-end items-end mt-4"
                    >
                        <button
                            onClick={handleUpdateProject}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-md font-medium py-2 px-4"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
