import React, {useState, useEffect} from 'react';
import { TicketVersion } from '../../types/Versions';
import { TextEditor } from '../TextEditor';
import { getTicketVersions } from '../../api/versions';
import { User } from '../../types/User';
import { getUsersData } from '../../api/users';
import dayjs from 'dayjs';
import { Ticket } from '../../types/Ticket';
import { updateTicketById } from '../../api/tickets';

type TicketVersionsDetailsType = {
    isOpen: boolean;
    ticketId: string;
};

export const TicketVersionsDetails: React.FC<TicketVersionsDetailsType> = ({isOpen, ticketId}) => {
    const [ticketVersions, setTicketVersions] = useState<TicketVersion[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
    const [users, setUsers] = useState<User[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchTicketVersions = async (initial = false) => {
        try {
            setLoading(true);
            const response: TicketVersion[] = await getTicketVersions(ticketId, "ticket", 10, initial ? undefined : startAfter);
            if (response.length < 10) setHasMore(false);

            setTicketVersions(prev => [...prev, ...response]);

            if (response.length > 0) {
                setStartAfter(response[response.length - 1].id);

                const authorIds = response.map(resp => resp.data.authorId);
                const handlerIds = response.map(resp => resp.data.handlerId).filter(Boolean) as string[];
                const uniqueIds = Array.from(new Set([...authorIds, ...handlerIds]));

                await fetchUsersData(uniqueIds);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchUsersData = async (userIds: string[]) => {
        if (userIds.length <= 0) return;

        try {
            const newIds = userIds.filter(id => !users.some(user => user.id === id));
            if (newIds.length === 0) return;

            const response = await getUsersData(newIds);
            setUsers(prev => [...prev, ...response]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRollback = async (itemId: string, ticket: Ticket) => {
        try {
            const resposne = await updateTicketById(itemId, ticket);

            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }


    useEffect(() => {
        setTicketVersions([]);
        setUsers([]);
        setStartAfter(undefined);
        setHasMore(true);
        fetchTicketVersions(true);
    }, [ticketId])

    return (
        <div className='block w-full lg:w-5/6 pl-4'>
            {ticketVersions.map((ticketVersion, id) => (
                <div
                    key={id}
                    className=''
                >
                    <div className='block my-4'>
                        <h1>
                            <span className='font-bold'>
                                Version:
                            </span> 
                            <span> {ticketVersion.version}</span>
                        </h1>
                        <p>
                            <span className='font-bold'>
                                Updated at: 
                            </span> 
                            <span>{dayjs(ticketVersion.timestamp).format("DD MMM YYYY hh:mm A")}</span>
                        </p>

                        <button
                            onClick={() => handleRollback(ticketId, ticketVersion.data)}
                            className="bg-indigo-500 rounded-md text-white hover:bg-indigo-700 p-2 mt-2"
                        >
                            Rollback
                        </button>
                    </div>

                    <form
                        className='block rounded-lg shadow-lg bg-gray-200 p-4 mb-10'
                    >
                        <div className='block lg:flex w-full justify-between my-4'>
                            <label 
                                className='lg:mx-4 w-1/3 font-semibold'
                                htmlFor="title"
                            >
                                Title
                                <input 
                                    id="title"
                                    type="text"
                                    disabled={true}
                                    value={ticketVersion.data.title}
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2' 
                                />
                            </label>

                            <label htmlFor="author" className='lg:mx-4 w-1/3 font-semibold'>
                                Author
                                <input
                                    id="author" 
                                    type="text"
                                    disabled={true}
                                    value={users.find((user) => user.id === ticketVersion.data.authorId)?.email ?? "No author"} 
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2'
                                />
                            </label>

                            <label htmlFor="handler" className='lg:mx-4 w-1/3 font-semibold'>
                                Handler
                                <input
                                    id="handler" 
                                    type="text"
                                    disabled={true}
                                    value={users.find((user) => user.id === ticketVersion.data.handlerId)?.email ?? `No handler`} 
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2'
                                />
                            </label>
                        </div>

                        <div className='block lg:flex my-4 w-full font-semibold'>
                            <label 
                                className='lg:mx-4 w-1/3'
                                htmlFor="type"
                            >
                                Type
                                <input 
                                    id="type"
                                    type="text"
                                    disabled={true}
                                    value={ticketVersion.data.type}
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2' 
                                />
                            </label>

                            <label htmlFor="priority" className='lg:mx-4 w-1/3 font-semibold'>
                                Priority
                                <input
                                    id="priority" 
                                    type="text"
                                    disabled={true}
                                    value={ticketVersion.data.priority} 
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2'
                                />
                            </label>

                            <label htmlFor="status" className='lg:mx-4 w-1/3 font-semibold'>
                                Status
                                <input
                                    id="status"  
                                    type="text"
                                    disabled={true}
                                    value={ticketVersion.data.status} 
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4'
                                />
                            </label>
                        </div>

                        <div className='w-full my-4 px-2 lg:px-4'>
                            <label 
                                htmlFor="description"
                                className='w-full font-semibold'
                            >
                                Description
                                <TextEditor 
                                    value={ticketVersion.data.description}
                                    onChange={() => {}}
                                    readonly={true}
                                    classname='block w-full bg-white text-gray-500 rounded-lg p-2 mt-2 mn-4 h-40 max-h-64 overflow-y-auto'
                                />
                            </label>
                        </div>

                        <div className='w-full my-4 px-2 lg:px-4'>
                            <label 
                                htmlFor="response"
                                className='w-full font-semibold'
                            >
                                Response
                                <TextEditor 
                                    value={ticketVersion.data.response ? ticketVersion.data.response : "No response"}
                                    onChange={() => {}}
                                    readonly={true}
                                    classname='block w-full bg-white text-gray-500 rounded-lg p-2 mt-2 mn-4 h-40 max-h-64 overflow-y-auto'
                                />
                            </label>
                        </div>
                    </form>
                </div>
            ))}

            {hasMore && (
                <div className="w-full text-center mt-4 mb-10">
                    <button 
                        disabled={loading}
                        onClick={() => fetchTicketVersions()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 px-4 py-2"
                    >
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    )
}
