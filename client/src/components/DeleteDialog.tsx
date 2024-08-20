import React, {useState} from 'react'
import { deleteTicketById } from '../api/getTickets'
import {IoCloseOutline} from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

interface Props {
    id: string | undefined
    onClose: () => void
    type: string
}

export const DeleteDialog: React.FC<Props> = ({id, onClose, type}) => {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    
    const handleDelete = async () => {
        setError(null)
        
        if (!id) {
            setError("Failed to get object data")
            return
        }

        if (type.toLowerCase() === "ticket") {
            const response = await deleteTicketById(id)

            if (!response) {
                setError("Failed to delete ticket")
                return
            }

            console.log("Ticket deleted successfully")
            navigate('/')
        }
    }
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-3/4 lg:w-3/6 xl:w-2/6 bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className='block justify-center mx-auto w-full bg-gray-50'>
                    <div className='flex w-full justify-end items-end text-end'>
                        <IoCloseOutline 
                            onClick={onClose}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            size={24}
                        />
                    </div>

                    <h1 className='flex justify-center mx-auto text-lg font-semibold'>
                        Are you sure you want to delete this {type} ?
                    </h1>

                    <div className='flex justify-center mx-auto my-8'>
                        <button
                            onClick={handleDelete} 
                            className='bg-green-600 hover:bg-green-800 text-white rounded-md px-6 py-2 mx-2'
                        >
                            Yes
                        </button>

                        <button
                            onClick={onClose} 
                            className='bg-red-500 hover:bg-red-700 text-white rounded-md px-6 py-2 mx-2'
                        >
                            No
                        </button>
                    </div>
                    
                    
                </div>
            </div>
        </div>
    )
}
