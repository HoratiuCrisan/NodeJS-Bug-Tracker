import React, {useState, useEffect} from 'react';
import { getProjectById } from '../../api/projects';
import { Project, ProjectCardType } from '../../types/Project';
import { TaskCard } from '../../types/Tasks';
import { IoCloseOutline } from 'react-icons/io5';
import { TextEditor } from '../TextEditor';
import { DatePicker } from '../DatePicker';
import Select, { MultiValue } from "react-select";

import {statusUpdateMenu} from "../../utils/selectOptions"
import { User } from '../../types/User';
import { updateTaskDescription, updateTaskStatus } from '../../api/tasks';

type EditSubtaskDialogType = {
    onClose: (value: boolean) => void;
    taskCard: TaskCard;
}

export const EditTaskDialog: React.FC<EditSubtaskDialogType> = ({taskCard, onClose}) => {
    const [project, setProject] = useState<ProjectCardType | undefined>(undefined);
    const [descripiton, setDescription] = useState<string>(taskCard.task.description);
    const [deadline, setDeadline] = useState<number>(taskCard.task.deadline);
    const [status, setStatus] = useState<string>(taskCard.task.status);
    const [members, setMembers] = useState<{label: string, value: string}[]>([]);
    const [handlers, setHandlers] = useState<{label: string, value: string}[]>([]);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const response: ProjectCardType = await getProjectById(taskCard.task.projectId);

                setProject(response)
                setMembers(response.members.map((member) => {return {label: member.email, value: member.id}}))
            } catch (error) {
                console.error(error);
            }
        }

        const handlerIds = taskCard.task.handlerIds;
        // Ensure only defined users are included
        const users = handlerIds
            .map((handlerId) => taskCard.users.find((user) => user.id === handlerId))
            .filter((user): user is User => user !== undefined);

        setHandlers(users.map((user) => {return {label: user.email, value: user.id}}));

        fetchProjectData();
    }, [taskCard]);

    const handleDescription = (value: string) => {
        setDescription(value);
    }

    const handleDeadline = (value: number) => {
        setDeadline(value);
    }

    const handleStatus = (value: string | undefined) => {
        if (!value) return;
        setStatus(value);
    }

    const handleMembers = (option: {label: string, value: string}[]) => {
        
    }

    const handleUpdateTaskDescription = async () => {
        if (taskCard.task.description === descripiton || descripiton.length < 10) return;

        try {
            await updateTaskDescription(taskCard.task.id, descripiton);
        } catch (error) {
            console.error(error);
        }
    }

    const handleUpdateTaskStatus = async () => {
        console.log(status)
        if (taskCard.task.status === status || !status) return;

        try {
            await updateTaskStatus(taskCard.task.id, status);
        } catch (error) {
            console.error(error);
        } 
    }

    const handleTaskUpdate = async () => {
        try {
            await Promise.all([
                handleUpdateTaskDescription(),
                handleUpdateTaskStatus(),
            ]);

            //window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }

    return (
         <div className='fixed flex inset-0 items-center justify-center bg-gray-800 bg-opacity-50 overflow-y-auto'>
            <div className='w-full md:w-5/6 lg:w-3/6 bg-gray-50 p-4 rounded-lg shadow-lg '>
                <div className='block justify-center w-full bg-gray-50 mx-auto'>
                    <div className='flex w-full justify-end items-end text-end mt-32 md:mt-28 lg:mt-0'>
                        <IoCloseOutline 
                            onClick={() => onClose(false)}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            size={24}
                        />
                    </div>
                </div>

                <h1 className="text-lg font-semibol my-2">
                    Description:
                </h1>

                <TextEditor 
                    value={descripiton}
                    onChange={handleDescription}
                    readonly={false}
                />

                <h1 className="mt-4 mb-1">Status: </h1>
                <Select 
                    options={statusUpdateMenu}
                    value={{label: status, value: status}}
                    onChange={(e) => handleStatus(e?.label)}
                />

                <h1 className="mt-4 mb-1">Handlers: </h1>
                <Select 
                    options={members}
                    value={handlers}
                    onChange={() => handleMembers}
                    isMulti
                />

                <h1 className="mt-4 mb-1">Deadline: </h1>
                <DatePicker 
                    value={deadline}
                    onInputChange={handleDeadline}
                    style="border-2 border-gray-400 focus:border-gray-500 rounded-md px-2"
                />

                <div className="flex gap-4 justify-end">
                    <button
                        onClick={() => onClose(false)}
                        className="bg-red-500 hover:bg-red-600 rounded-md text-white py-2 px-4"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleTaskUpdate}
                        className="bg-emerald-500 hover:bg-emerald-600 rounded-md text-white py-2 px-4"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
