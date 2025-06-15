import React, {useContext, useState} from 'react'
import {IoCloseOutline} from 'react-icons/io5'
import Select from 'react-select'
import { selectStyles, customStyles } from '../utils/Select-Styles'
import { updateTicketById } from '../api/tickets'
import { Ticket } from '../types/Ticket'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserProvider'
import { ErrorDialog } from './ErrorDialog'

type UpdateStatusDialogType = {
    defaultStatus: string;
    onClose: (value: boolean) => void
    options: {label: string, value: string}[]
    ticket: Ticket;
    isFetched: React.MutableRefObject<boolean>;
}


export const UpdateStatusDialog: React.FC<UpdateStatusDialogType> = ({defaultStatus, onClose, options, ticket, isFetched}) => {
    const { loading, user } = useContext(UserContext);
    const navigate = useNavigate()
    const [statusUpdateValue, setStatusUpdateValue] = useState<string | undefined>(defaultStatus)
    const [error, setError] = useState<string | null>(null)
    const [errorDialog, setErrorDialog] = useState<boolean>(false);

    if (!user) {
        return <div>Loading...</div>
    }

    const handleUpdate = async (id: string | undefined) => {
        console.log(statusUpdateValue);
        setError(null)

        if (!id) {
            setError("Invalid id");
            setErrorDialog(true);
            return;
        }

        if (!statusUpdateValue) {
            setError("Error! Please select a value for status")
            setErrorDialog(true);
            return
        }

        if (!user.displayName) {
            setError("Unauthenticated user! Please login!")
            setErrorDialog(true);
            return
        }
        
        if (error) 
            return

        const changedTicket: Ticket = {
            id: ticket.id,
            title: ticket.title,
            authorId: ticket.authorId,
            description: ticket.description,
            deadline: ticket.deadline,
            handlerId: ticket.handlerId,
            createdAt: ticket.createdAt,
            closedAt: ticket.closedAt,
            status: statusUpdateValue,
            priority: ticket.priority,
            type: ticket.type,
            response: ticket.response,
            files: ticket.files,
            notified: ticket.notified,
        }

        const response = await updateTicketById(id, changedTicket);

        if (!response) {
            setError("Error! Failed to update ticket")
            return
        }

        isFetched.current = false;
        onClose(true)

        window.location.reload();
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-4/5 md:w-3/5 lg:w-3/6 xl:w-2/6 bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className='block justify-center mx-auto w-full bg-gray-50'>
                    <div className='flex w-full justify-end items-end text-end'>
                        <IoCloseOutline 
                            onClick={() => onClose(true)}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            size={24}
                        />
                    </div>

                    <h1 className='flex justify-center text-lg my-2'>Update ticket status</h1>

                    <div className='flex justify-center items-center mx-auto my-8'>
                        <Select 
                            options={options}
                            defaultValue={{label: defaultStatus, value: defaultStatus}}
                            className='w-1/3'
                            placeholder='Update Status'
                            onChange={(e) => setStatusUpdateValue(e?.value)}
                            styles={{...selectStyles("#cbd5e1", "#000"), ...customStyles}}
                        />
                    </div>

                    <div className='flex justify-center mx-auto pb-6'>
                        <button
                            disabled={statusUpdateValue  !== defaultStatus ? false : true} 
                            onClick={() => handleUpdate(ticket.id)}
                            className={`${statusUpdateValue  !== defaultStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-400'} text-white rounded-md p-2 `}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {error && <ErrorDialog text={error} onClose={() => setErrorDialog(false)}/>}
        </div>
    )
}
