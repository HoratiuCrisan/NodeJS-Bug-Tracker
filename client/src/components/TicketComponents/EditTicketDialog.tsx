import React from 'react'
import { IoCloseOutline } from 'react-icons/io5';
import { EditTicketDialogForm } from './EditTicketDialogForm';
import { Ticket } from '../../utils/interfaces/Ticket';

interface EditTicketDialogProps {
    onClose: (value: boolean) => void;
    ticketId: string | undefined;
    ticketData: Ticket | undefined;
    isFetched: React.MutableRefObject<boolean>;
}

export const EditTicketDialog: React.FC<EditTicketDialogProps> = ({onClose, ticketId, ticketData, isFetched}) => {
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
                    
                    <EditTicketDialogForm 
                        onClose={onClose}
                        ticketId={ticketId}
                        ticketData={ticketData}
                        isFetched={isFetched}
                    />
                </div>
            </div>

        </div>
    )
}
