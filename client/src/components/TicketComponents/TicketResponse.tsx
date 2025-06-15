import React, {useEffect, useState} from 'react'
import { Ticket } from '../../types/Ticket';
import { updateTicketById } from '../../api/tickets';
import { TextEditor } from '../TextEditor';
import { useCan } from '../../hooks/useCan';

type TicketResponseType = {
    ticket: Ticket;
}

export const TicketResponse: React.FC<TicketResponseType> = ({ticket}) => {
    const [ticketResponse, setTicketResponse] = useState<string>('');
    const [isUpdateDisabled, setIsUpdateDisabled] = useState<boolean>(true);
    const canUpdateResponse = useCan("updateTicketStatus", ticket);

    /* Update every time the ticket data updates */
    useEffect(() => {
        /* Set the ticket response into a use state */
        if (ticket.response) {
            setTicketResponse(ticket.response);
        }
    }, [ticket]);

    /* Update every time the ticket response changes */
    useEffect(() => {
        /* If the response changed, enable the update button */
        if (ticketResponse !== '' && ticketResponse !== ticket.response) {
            setIsUpdateDisabled(false);
        }
    }, [ticketResponse])

    const handleTicketUpdateById = async () => {
        /* If the response is empty exit */
        if (!ticketResponse || ticketResponse.length === 0) {
            return;
        }

        /* Store the ticket data into a new variable and uptate the response */
        const updatedTicket: Ticket = ticket;
        updatedTicket.response = ticketResponse;

        try {
            /* Send the update request with the updated response data */
            await updateTicketById(ticket.id, updatedTicket);

            window.location.reload();
        } catch (error) {
            console.error(error);
            return;
        }
    };

    return (
        <div className='w-full lg:w-3/4 bg-gray-50 rounded-md shadow-md p-2'>
            <h1 className='text-md lg:text-lg font-semibold my-4 mx-2'>Ticket Response:</h1>
            {/* If the user is the handler of the ticket display a response editor  */}
            {canUpdateResponse ? 
                <>
                <TextEditor 
                    value={ticketResponse}
                    onChange={setTicketResponse}
                    readonly={false}
                />
                
                {/* Display the save changes button to the ticket handler */}
                
                <div className='flex justify-end mt-10 mb-4'>
                    <button
                        onClick={handleTicketUpdateById}
                        disabled={isUpdateDisabled} 
                        className={`${isUpdateDisabled ? 'bg-emerald-400 text-gray-100' : 'bg-green-600 text-white'} rounded-md mr-5 p-2`}
                    >
                        Save changes
                    </button>
                </div>
            </>
            :
                <>
                    {/* Display the response message to the admins or the author of the ticket */}
                    <p 
                        className='my-2 text-md font-sans p-4'
                        dangerouslySetInnerHTML={{ __html: ticket.response ? ticket.response : "" }}
                    />
                </>
            }

        </div>
    )
}
