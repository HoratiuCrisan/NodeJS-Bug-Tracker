import React, {useState} from 'react';
import { createTaskResponse } from '../../api/tasks';
import { TextEditor } from '../TextEditor';
import { IoCloseOutline } from 'react-icons/io5';

type AddTaskResponseType = {
    taskId: string;
    onClose: (value: boolean) => void;
}

export const AddTaskResponse: React.FC<AddTaskResponseType> = ({onClose, taskId}) => {
    const [response, setResponse] = useState<string>("");
    
    const handleResponse = (text: string) => {
        setResponse(text);
    }

    const handleTaskResponse = async (id: string, text: string) => {
        try {
            await createTaskResponse(id, text);
            onClose(false);

            window.location.reload();
        } catch (error) {
            console.error(JSON.stringify(error));
            return;
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

                    <h1 className="font-semibold text-lg my-4">Add response: </h1>
                    <div className='bg-white'>
                        <TextEditor
                            value={response}
                            onChange={handleResponse}
                            readonly={false}
                        />

                        <div className='flex justify-end items-end my-4'>
                            <button
                                onClick={() => onClose(false)}
                                className='bg-red-500 hover:bg-red-600 text-white hover:text-gray-100 rounded-md p-2 mx-1 mb-2'
                            >
                                Close
                            </button>

                            <button
                                onClick={() => handleTaskResponse(taskId, response)}
                                className='bg-green-500 hover:bg-green-600 text-white hover:text-gray-100 rounded-md p-2 mx-1 mb-2'
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
