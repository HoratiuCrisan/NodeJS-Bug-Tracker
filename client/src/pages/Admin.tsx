import React, {useState, useEffect} from 'react'
import { getAuth } from 'firebase/auth'
import { getAllTickets } from '../api/tickets';
import { Ticket, TicketCardType } from '../types/Ticket';

export const Admin = () => {
    const auth = getAuth();
    const [tickets, setTickets] = useState<TicketCardType[]>([]);

    useEffect(() => {
        if (auth.currentUser) {
            fetchTickets(); 
        }
    }, [auth]);

    const fetchTickets =  async () => {
        const response: TicketCardType[] = await getAllTickets(10, "title", "asc", undefined, undefined, undefined);

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
                    {ticket.title}
                </h1>
            ))}
        </div>
    )
}
