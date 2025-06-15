import React, { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { TicketCardType } from '../../types/Ticket';
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

export const TicketViewContainer: React.FC<TicketViewContainerType> = ({ 
    limit, order, orderDirection, searchQuery, priority, status 
}) => {
    const { user } = useContext(UserContext);
    const [tickets, setTickets] = useState<TicketCardType[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const observerRef = useRef<HTMLDivElement | null>(null);

    // Helper to clean "undefined" string to actual undefined
    const cleanParam = (param?: string) => (param === "undefined" ? undefined : param);

    const fetchTickets = useCallback(async () => {
        if (!user || loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await getUserTickets(
                user.id,
                limit,
                order,
                orderDirection,
                cleanParam(searchQuery),
                cleanParam(priority),
                cleanParam(status),
                startAfter
            );

            console.log(response);

            if (response.length === 0) {
                setHasMore(false);
            } else {
                setTickets(prev => {
                    const existingIds = new Set(prev.map(t => t.id));
                    const newTickets = response.filter(t => !existingIds.has(t.id));
                    return [...prev, ...newTickets];
                });
                setStartAfter(response[response.length - 1].id);
            }
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    }, [user, limit, order, orderDirection, searchQuery, priority, status, startAfter, loading, hasMore]);

    // Reset state on filter/order/search changes
    useEffect(() => {
        if (!user) return;
        setTickets([]);
        setStartAfter(undefined);
        setHasMore(true);
    }, [user, limit, order, orderDirection, searchQuery, priority, status]);

    // Fetch initial tickets and on dependency change
    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Setup IntersectionObserver to load more on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                fetchTickets();
            }
        });
        const current = observerRef.current;
        if (current) observer.observe(current);
        return () => {
            if (current) observer.unobserve(current);
        };
    }, [fetchTickets, hasMore, loading]);

    return (
        <div className='block my-2'>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {tickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                ))}
            </div>
            <div ref={observerRef} className="h-10 w-full flex justify-center items-center">
                {loading && <p>Loading more tickets...</p>}
                {!hasMore && <p>No more tickets.</p>}
            </div>
        </div>
    );
};
