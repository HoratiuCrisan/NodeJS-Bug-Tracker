import React from 'react';
import { FaDownload } from "react-icons/fa";
import { TextEditor } from '../TextEditor';

interface TicketVersionsDetailsProps {
    isOpen: boolean
}

const tickets = [
    {
        Author: 'John',
        AuthorPicture: '',
        CreatedAt: '',
        Deadline: '',
        Description: 'Test ticket versioning system ',
        Files: [],
        Handler: '',
        HandlerId: '',
        Priority: 'Hight',
        Response: '',
        Status: 'New',
        Title: 'Ticket',
        Type: 'Feature',
        updatedAt: 'June 24, 2024 at 8:17:12 AM UTC+3',
        updatedBy: 'Horatiu Crisan',
        version: 1719206232945

    },
    {
        Author: 'John',
        AuthorPicture: '',
        CreatedAt: '',
        Deadline: '',
        Description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
        Files: [],
        Handler: '',
        HandlerId: '',
        Priority: 'Hight',
        Response: '',
        Status: 'New',
        Title: 'Ticket',
        Type: 'Feature',
        updatedAt: 'June 24, 2024 at 8:17:12 AM UTC+3',
        updatedBy: 'Horatiu Crisan',
        version: 1719206232945
    }
]

export const TicketVersionsDetails: React.FC<TicketVersionsDetailsProps> = ({isOpen}) => {
    return (
        <div className='block w-full lg:w-5/6 pl-4'>
            {tickets.map((ticket, id) => (
                <div
                    key={id}
                    className=''
                >
                    <div className='block my-4'>
                        <h1>
                            <span className='font-bold'>
                                Version:
                            </span> 
                            <span> {ticket.version}</span>
                        </h1>
                        <h1>
                            <span className='font-bold'>
                                Updated by: 
                            </span> 
                             <span> {ticket.updatedBy}</span>
                        </h1>
                        <p>
                            <span className='font-bold'>
                                Updated at: 
                            </span> 
                            <span> {ticket.updatedAt}</span>
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
                                    value={ticket.Title}
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2' 
                                />
                            </label>

                            <label htmlFor="author" className='lg:mx-4 w-1/3 font-semibold'>
                                Author
                                <input
                                    id="author" 
                                    type="text"
                                    disabled={true}
                                    value={ticket.Author} 
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2'
                                />
                            </label>

                            <label htmlFor="handler" className='lg:mx-4 w-1/3 font-semibold'>
                                Handler
                                <input
                                    id="handler" 
                                    type="text"
                                    disabled={true}
                                    value={ticket.Handler.length > 0 ? ticket.Handler : 'No handler'} 
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
                                    value={ticket.Type}
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2' 
                                />
                            </label>

                            <label htmlFor="priority" className='lg:mx-4 w-1/3 font-semibold'>
                                Priority
                                <input
                                    id="priority" 
                                    type="text"
                                    disabled={true}
                                    value={ticket.Priority} 
                                    className='block w-full rounded-lg p-2 text-gray-500 bg-white mb-4 mt-2'
                                />
                            </label>

                            <label htmlFor="status" className='lg:mx-4 w-1/3 font-semibold'>
                                Status
                                <input
                                    id="status"  
                                    type="text"
                                    disabled={true}
                                    value={ticket.Status} 
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
                                    value={ticket.Description}
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
                                    value={ticket.Response.length > 0 ? ticket.Response: 'No response'}
                                    onChange={() => {}}
                                    readonly={true}
                                    classname='block w-full bg-white text-gray-500 rounded-lg p-2 mt-2 mn-4 h-40 max-h-64 overflow-y-auto'
                                />
                            </label>
                        </div>

                        <div className='block my-4'>
                            {ticket.Files && ticket.Files.map((file, FileId) => (
                                <span
                                    key={FileId} 
                                    className='flex justify-between'
                                >
                                    <h6>{file}</h6>
                                </span>
                            ))
                                
                            }
                        </div>
                    </form>
                </div>
            ))}
        </div>
    )
}
