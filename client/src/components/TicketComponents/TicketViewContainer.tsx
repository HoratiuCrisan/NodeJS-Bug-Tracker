import React, { useState, useEffect, useContext } from 'react'
import { TicketCardType } from '../../types/Ticket';
import { useNavigate } from 'react-router-dom'
import { TicketCard } from './TicketCard';
import { getUserTickets } from '../../api/tickets';
import { UserContext } from '../../context/UserProvider';

type TicketViewContainerType = {
    limit: number;
    order: string;
    orderDirection: string;
    searchQuery?: string;
    priority?: string;
    status?: string;
}

export const TicketViewContainer: React.FC<TicketViewContainerType> = ({ limit, order, orderDirection, searchQuery, priority, status}) => {
    const { user } = useContext(UserContext);
    const [tickets, setTickets] = useState<TicketCardType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [errorDialog, setErrorDialog] = useState<boolean>(false);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchUserTickets = async (userId: string) => {
            try {
                const response: TicketCardType[] = await getUserTickets(
                    userId, 
                    limit, 
                    order, 
                    orderDirection, 
                    searchQuery, 
                    priority, 
                    status, 
                    startAfter
                );

                console.log(response);

                setTickets(response);

                setStartAfter(response[response.length - 1].id);
            } catch (error) {
                setError(`Failed to retrieve your tickets`);
                setErrorDialog(true);
            }
        };

        if (user) {
            fetchUserTickets(user.id);
        }

    }, [order, orderDirection, searchQuery, priority, status]);

    return (
        <div className='block my-2'>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {tickets.map((ticket, index) => (
                    <TicketCard
                        key={index}
                        ticket={ticket}
                    />
                ))}
            </div>
        </div>
    );
};
