import React, {useEffect, useState} from 'react'
import { IoCloseOutline } from 'react-icons/io5';
import { createSubtask } from '../../api/tasks';
import Select from "react-select";
import { User } from '../../types/User';
import { TextEditor } from '../TextEditor';


type CreateSubtaskDialogType = {
    taskId: string;
    members: User[];
    onClose: (value: boolean) => void
}

export const CreateSubtaskDialog: React.FC<CreateSubtaskDialogType> = ({taskId, members, onClose}) => {
    const [handlerOptions, setHandlerOptions] = useState<{label: string, value: string}[]>([])
    const [subtaskHandler, setSubtaskHandler] = useState<string | undefined>(undefined);
    const [subtaskDescription, setSubtaskDescription] = useState<string>("");

    useEffect(() => {
        console.log(subtaskHandler);
        setHandlerOptions(members.map((member: User) => {return {label: member.email, value: member.id}}));
    }, [taskId])

    const createNewSubtask = async (handlerId: string | undefined, description: string) => {
        if (!handlerId) return;

        try {
            await createSubtask(taskId, handlerId, description);

            onClose(false);
            
            window.location.reload();
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const handleSubtaskHandler = (value: string | undefined) => {
        if (!value) return;

        console.log(value)
        setSubtaskHandler(value);
    }

    const handleSubtaskDescription = (value: string | undefined) => {
        if (!value) return;

        setSubtaskDescription(value)
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

                    <h1 className="font-medium text-lg my-2">Subtask description</h1>
                    <TextEditor 
                        value={subtaskDescription}
                        onChange={handleSubtaskDescription}
                        readonly={false}
                        classname={`my-4`}
                    />

                    <h1 className="font-medium text-lg my-2">Select subtask handler</h1>

                    <Select 
                        options={handlerOptions}
                        onChange={(e) => handleSubtaskHandler(e?.value)}
                    />

                    <div className="flex justify-end items-end text-end font-semibold mt-8 mb-2 gap-2">
                        <button
                            onClick={() => onClose(false)} 
                            className="bg-red-500 hover:bg-red-600 text-white hover:text-gray-300 rounded-md p-2"
                        >
                            Cancel
                        </button>
                        
                        <button 
                            onClick={() => createNewSubtask(subtaskHandler, subtaskDescription)}
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
