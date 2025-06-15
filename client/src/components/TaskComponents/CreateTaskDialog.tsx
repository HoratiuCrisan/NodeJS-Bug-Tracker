import React, {useState, useEffect} from 'react';
import { User } from '../../types/User';
import { Task } from '../../types/Tasks';
import { IoCloseOutline } from 'react-icons/io5';
import { TextEditor } from '../TextEditor';
import Select, { MultiValue } from "react-select";
import { DatePicker } from '../DatePicker';
import { createTask } from '../../api/tasks';

type CreateTaskDialogType = {
    projectId: string;
    members: User[];
    onClose: (value: boolean) => void;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogType> = ({projectId, members, onClose}) => {
    const [description, setDescription] = useState<string>("");
    const [handlerIds, setHandlerIds] = useState<string[]>([]);
    const [deadline, setDeadline] = useState<number>(Date.now());
    const [handlerOptions, setHandlerOptions] = useState<{label: string, value: string}[]>([]);

    useEffect(() => {
        setHandlerOptions(members.map((member) => {return {label: member.email, value: member.id}}));
    }, [projectId, members]);

    const handleDescription = (value: string | undefined) => {
        if (!value) return;

        setDescription(value);
    }

    const handleHandlerIds = (options: MultiValue<{label: string, value: string}>) => {
        if (options.length === 0) return;

        setHandlerIds(options.map((option) => option.value));
    }

    const handleDeadline = (value: number) => {
        setDeadline(value);
    }

    const handleCreateTask = async (projectId: string, description: string, handlers: string[], deadline: number) => {
        console.log(projectId, description, handlerIds, deadline);
        try {
            const response = await createTask(projectId, handlers, description, deadline);

            console.log(response);
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-4/5 md:w-3/5 lg:w-3/6 bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className="block justify-center mx-auto w-full bg-gray-50">
                    <div className="flex w-full justify-end items-end text-end">
                        <IoCloseOutline
                            onClick={() => onClose(false)}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            size={24}
                        />
                    </div>

                    <h1 className="font-medium text-lg my-2">Task description</h1>
                    <TextEditor 
                        value={description}
                        onChange={handleDescription}
                        readonly={false}
                        classname={`my-4`}
                    />

                    <h1 className="font-medium text-lg my-2">Select task handlers</h1>
                    <Select 
                        isMulti={true}
                        options={handlerOptions}
                        onChange={handleHandlerIds}
                    />

                    <h1 className="font-semibold text-lg mt-4">Task deadline</h1>
                    <DatePicker 
                        value={deadline}
                        onInputChange={handleDeadline}
                        style="block w-full text-sm md:w-1/3 xl:w-2/5 2xl:w-1/6 border-2 border-gray-300 focus:border-gray-800 rounded-md p-2 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-2"
                    />

                    <div className="flex justify-end items-end text-end font-semibold mt-8 mb-2 gap-2">
                        <button
                            onClick={() => onClose(false)} 
                            className="bg-red-500 hover:bg-red-600 text-white hover:text-gray-300 rounded-md p-2"
                        >
                            Cancel
                        </button>
                        
                        <button 
                            onClick={() => {handleCreateTask(projectId, description, handlerIds, deadline); onClose(false)}}
                            className="bg-green-500 hover:bg-green-600 text-white hover:text-gray-300 rounded-md p-2"
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
