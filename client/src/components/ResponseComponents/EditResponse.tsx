import React, {useState, useEffect} from 'react';
import { Response } from '../../types/Tasks';

import { updateResponseMessage } from '../../api/tasks';

import { IoCloseOutline } from 'react-icons/io5';
import { TextEditor } from '../TextEditor';

type EditResponseType = {
    onClose: (value: boolean) => void;
    response: Response;
}

export const EditResponse: React.FC<EditResponseType> = ({response, onClose}) => {
    const [message, setMessage] = useState<string>(response.message);
    
    useEffect(() => {}, [response]);

    const hanleMessage = (value: string) => {
        setMessage(value);
    }

    const handleResponseUpdate = async (value: string) => {
        if (value.length === 0) return;

        try {
            await updateResponseMessage(response.taskId, response.id, value);
            onClose(false);

            window.location.reload();
        } catch (error) {
            console.error(error);
            return;
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

                <h1 className="mt-4 mb-2 font-semibold text-lg">Response: </h1>

                <TextEditor 
                    value={message}
                    onChange={hanleMessage}
                    readonly={false}
                    classname="my-4"
                />
        
                <div className="flex justify-end items-end gap-4">
                    <button
                        onClick={() => onClose(false)} 
                        className="bg-red-600 text-white rounded-md hover:bg-red-700 hover:text-gray-200 p-2"
                    >
                        Cancel
                    </button>

                    <button 
                        onClick={() => handleResponseUpdate(message)}
                        className="bg-green-600 text-white rounded-md hover:bg-green-700 hover:text-gray-200 p-2"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>

    )
}
