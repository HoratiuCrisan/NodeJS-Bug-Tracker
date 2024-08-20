import React, {useState} from 'react'
import {IoCloseOutline} from 'react-icons/io5'
import Select from 'react-select'
import { selectStyles, customStyles } from '../utils/Select-Styles'
import { updateTicketById } from '../api/getTickets'
import { Ticket } from '../utils/interfaces/Ticket'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'

interface UpdateStatusProps {
    status: string
    onClose: (value: boolean) => void
    type: string
    options: {label: string, value: string}[]
    id: string | undefined
    ticket: Ticket | undefined;
    isFetched: React.MutableRefObject<boolean>;
}


export const UpdateStatusDialog: React.FC<UpdateStatusProps> = ({status, onClose, type, options, id, ticket, isFetched}) => {
    const navigate = useNavigate()
    const auth = getAuth()
    const [statusUpdateValue, setStatusUpdateValue] = useState<string | undefined>(status)
    const [error, setError] = useState<string | null>(null)

    const handleUpdate = async (id: string | undefined) => {
        setError(null)
        if (id === undefined) {
            setError("Error at getting the id")
            return
        }

        if (ticket === undefined) {
            setError("Error at getting the ticket data")
            return
        }

        if (statusUpdateValue === undefined) {
            setError("Error! Please select a value for status")
            return
        }

        if (!auth.currentUser?.displayName) {
            setError("Unauthenticated user! Please login!")
            return
        }
        
        if (error !== null)
            return

        const changedTicket: Ticket = {
            Author: ticket.Author,
            Title: ticket.Title,
            AuthorPicture: ticket.AuthorPicture,
            Description: ticket.Description,
            Status: statusUpdateValue,
            Priority: ticket.Priority,
            Type: ticket.Type,
            Handler: ticket.Handler,
            HandlerId: ticket.HandlerId,
            Deadline: ticket.Deadline,
            CreatedAt: ticket.CreatedAt,
            Response: ticket.Response,
            Files: ticket.Files
        }

        const response = await updateTicketById(id, changedTicket, auth.currentUser.displayName)

        if (!response) {
            setError("Error! Failed to update ticket")
            return
        }

        isFetched.current = false;
        onClose(true)
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-4/5 md:w-2/4 lg:w-2/5 xl:w-1/4 bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className='block justify-center mx-auto w-full bg-gray-50'>
                    <div className='flex w-full justify-end items-end text-end'>
                        <IoCloseOutline 
                            onClick={() => onClose(true)}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            size={24}
                        />
                    </div>

                    <h1 className='flex justify-center text-lg my-2'>Update {type} status</h1>

                    <div className='flex justify-center items-center mx-auto my-8'>
                        <Select 
                            options={options}
                            defaultValue={{label: status, value: status}}
                            className='w-1/3'
                            placeholder='Update Status'
                            onChange={(e) => setStatusUpdateValue(e?.value)}
                            styles={{...selectStyles("#cbd5e1", "#000"), ...customStyles}}
                        />
                    </div>

                    <div className='flex justify-center mx-auto pb-6'>
                        <button
                            disabled={statusUpdateValue  !== status ? false : true} 
                            onClick={() => handleUpdate(id)}
                            className={`${statusUpdateValue  !== status ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-400'} text-white rounded-md p-2 `}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
