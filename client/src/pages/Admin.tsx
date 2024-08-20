import React, {useState, useEffect} from 'react'
import { getAuth } from 'firebase/auth'
import { getAllTickets } from '../api/getTickets';
import { Ticket } from '../utils/interfaces/Ticket';

interface TicketObject {
    id: string;
    data: Ticket;
}

export const Admin = () => {
    const auth = getAuth();
    const [tickets, setTickets] = useState<TicketObject[]>([]);

    useEffect(() => {
        if (auth.currentUser) {
            fetchTickets(); 
        }
    }, [auth]);

    const fetchTickets =  async () => {
        const response: TicketObject[] = await getAllTickets();

        if (response) {
            console.log("All tickets ", response);
            setTickets(response);
        }
    }

    return (
        <div className='lg:pl-32 bg-red-500'>
            All tickets
            {tickets.map((ticket, id) => (
                <h1 className='text-black' key={id}>
                    {ticket.data.Title}
                </h1>
            ))}
        </div>
    )
}
