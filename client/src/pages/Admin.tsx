import React, {useState, useEffect, useContext, useRef, useCallback} from 'react'
import { getAllTickets } from '../api/tickets';
import { Ticket, TicketCardType } from '../types/Ticket';
import { UserContext } from '../context/UserProvider';
import { TicketCard } from '../components/TicketComponents/TicketCard';
import { FaRegEnvelope } from 'react-icons/fa';

export const Admin = () => {
    const {user, loading} = useContext(UserContext);
    const [tickets, setTickets] = useState<TicketCardType[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [orderBy, setOrderBy] = useState<string>("deadline");
    const [direction, setDirection] = useState<string>("desc");
    const [isFetching, setIsFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<string | undefined>("new");

    const observer = useRef<IntersectionObserver | null>(null);
    const lastTicketRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isFetching || !hasMore) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    fetchAllTickets();
                }
            });
            if (node) observer.current.observe(node);
        },
        [isFetching, hasMore]
    );

    const fetchAllTickets = async () => {
        if (!user || isFetching || !hasMore) return;

        setIsFetching(true);
        
        try {
            const response: TicketCardType[] = await getAllTickets(10, orderBy, direction, searchQuery, status, startAfter);

            if (response.length < 10) setHasMore(false);
            if (response.length > 0) {
                setStartAfter(response[response.length - 1].id);
                setTickets(prev => [...prev, ...response]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    }

    useEffect(() => {
        if (user) {
            fetchAllTickets();
        }
    }, [user]);

    if (!user || loading) {
        return <>Loading...</>
    }

    return (
        <div className='px-4 lg:px-8 block my-4'>
           <div className='flex text-xl font-semibold font-sans'>
                <span className='mt-1 text-2xl'>
                    <FaRegEnvelope />
                </span>
                
                <h1 className='mx-2'>
                    Unassigned tickets
                </h1>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {tickets.map((ticket, index) => {
                    const isLast = index === tickets.length - 1;
                    return (
                        <div 
                            ref={isLast ? lastTicketRef : null}
                            key={ticket.id}
                        >   
                            <TicketCard ticket={ticket} />
                        </div>
                    );
                })}
            </div>   

            {isFetching && <div className="text-center py-4 text-gray-500">Loading more...</div>}
            {!hasMore && <div className="text-center py-4 text-gray-400">No more tickets.</div>}
        </div>
    );
}
