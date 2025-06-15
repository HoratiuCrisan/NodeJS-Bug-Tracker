import React, {useState} from 'react'
import { deleteTicketById } from '../api/tickets'
import {IoCloseOutline} from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { deleteSubtask, deleteTask, deleteTaskResponse } from '../api/tasks'
import { deleteGroup } from '../api/groups'
import { deleteProject } from '../api/projects'

interface Props {
    id: string | undefined
    onClose: (value: boolean) => void
    type: string
    parentId?: string;
}

export const DeleteDialog: React.FC<Props> = ({id, onClose, type, parentId}) => {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    
    const handleDelete = async () => {
        setError(null)
        
        if (!id) {
            return;
        }

        try {
            switch(type.toLowerCase()) {
                case "task":
                    await deleteTask(id);
                    onClose(false);
                    return;
                case "project":
                    await deleteProject(id);
                    onClose(false);
                    window.location.href="/projects"
                    return;
                case "ticket":
                    await deleteTicketById(id);
                    onClose(false);
                    return;
                case "subtask":
                    if (parentId) {
                        await deleteSubtask(parentId, id);
                    }
                    onClose(false);
                    return;
                case "response":
                    if (parentId) {
                        await deleteTaskResponse(parentId, id);
                        window.location.reload()
                    }
                    onClose(false);
                    return;
                case "group":
                    await deleteGroup(id);
                    onClose(false);
                    return;
            }

            onClose(false);
        } catch (error) {
            setError(`Failed to delete ${type}`);
            onClose(false);
            return;
        }
    }
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-3/4 lg:w-3/6 xl:w-2/6 bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className='block justify-center mx-auto w-full bg-gray-50 text-black'>
                    <div className='flex w-full justify-end items-end text-end'>
                        <IoCloseOutline 
                            onClick={() => onClose(false)}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            size={24}
                        />
                    </div>

                    <h1 className='flex justify-center mx-auto text-lg font-semibold'>
                        Are you sure you want to delete this {type} ?
                    </h1>

                    <div className='flex justify-center mx-auto my-8'>
                        <button
                            onClick={() => onClose(false)} 
                            className='bg-red-500 hover:bg-red-700 text-white rounded-md px-6 py-2 mx-2'
                        >
                            No
                        </button>

                        <button
                            onClick={handleDelete} 
                            className='bg-green-600 hover:bg-green-800 text-white rounded-md px-6 py-2 mx-2'
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
