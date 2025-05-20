import React, {useState, useEffect} from 'react';
import { TicketVersion } from '../../types/Versions';
import { TextEditor } from '../TextEditor';
import { getTicketVersions } from '../../api/versions';

type TicketVersionsDetailsType = {
    isOpen: boolean;
    ticketId: string;
};

export const TicketVersionsDetails: React.FC<TicketVersionsDetailsType> = ({isOpen, ticketId}) => {
    const [ticketVersions, setTicketVersions] = useState<TicketVersion[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchTicketVersions = async () => {
            try {
                const response: TicketVersion[] = await getTicketVersions(ticketId, "ticket", 10, undefined);

                setTicketVersions(response);
            } catch (error) {
                console.error(error);
                return;
            }
        }

        fetchTicketVersions();
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
                            <span> {new Date(ticketVersion.timestamp).toLocaleTimeString()}</span>
                        </p>
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
                                    value={ticketVersion.data.authorId} 
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2'
                                />
                            </label>

                            <label htmlFor="handler" className='lg:mx-4 w-1/3 font-semibold'>
                                Handler
                                <input
                                    id="handler" 
                                    type="text"
                                    disabled={true}
                                    value={ticketVersion.data.handlerId ? ticketVersion.data.handlerId : `No handler`} 
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

                        {/* <div className='block my-4'>
                            {ticket.Files && ticket.Files.map((file, FileId) => (
                                <span
                                    key={FileId} 
                                    className='flex justify-between'
                                >
                                    <h6>{file}</h6>
                                </span>
                            ))
                                
                            }
                        </div> */}
                    </form>
                </div>
            ))}
        </div>
    )
}
