import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getUserTicketById } from '../../api/tickets';
import { Ticket, TicketObject } from '../../utils/types/Ticket';
import { UpdateStatusDialog } from '../UpdateStatusDialog';
import { DeleteDialog } from '../DeleteDialog';
import { TextEditor } from '../TextEditor';
import { FilesUpload } from '../FilesUpload';
import { updateTicketById } from '../../api/tickets';
import { getAuth } from 'firebase/auth';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { TicketVersionsDetails } from './TicketVersionsDetails';
import { EditTicketDialog } from './EditTicketDialog';
import { UserContext } from '../../context/UserProvider';

export const TicketDetails = () => {
    const {userRole} = useContext(UserContext);
    const auth = getAuth();
    const params = useParams()
    const isFetched = useRef<boolean>(false);
    const [ticket, setTicket] = useState<TicketObject>()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [ticketResponse, setTicketResponse] = useState<string>('')
    const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState<boolean>(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
    const [isVersionOpen, setIsVersionOpen] = useState<boolean>(false)

    const ticketsMenu = [
        {text: "Deadline", value: new Date(Number(ticket?.ticket.deadline)).toLocaleString(), style: 'text-green-600 border-green-600 hover:bg-green-600 hover:text-white'},
        {text: "Type", value: ticket?.ticket.type, style: 'text-yellow-600 border-yellow-600 hover:bg-yellow-600 hover:text-white'},
        {text: "Priority", value: ticket?.ticket.priority, style: 'text-red-600 border-red-600 hover:bg-red-600 hover:text-white'},
        {text: "Status", value: ticket?.ticket.status, style: 'text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'}
    ]

    const statusUpdateMenu = [
        {label: "Development", value: "Development"},
        {label: "On-Hold", value: "On-Hold"},
        {label: "Completed", value: "Completed"}
    ]
    
    useEffect(() => {
        if (!isFetched.current) {
            fetchTicketDetails(params.id)
            isFetched.current = true
        }
    }, [isFetched.current]);

    useEffect(() => {}, [auth]);

    const fetchTicketDetails = async (id: string | undefined) => {
        if (id === undefined) {
            return;
        }

        console.log("PARAMS ID: ", id);

        if (!auth.currentUser?.uid) {
            return;
        }

        const response = await getUserTicketById(auth.currentUser.uid , id);
        
        if (response) {
            console.log("TICKET: ", response)
            setTicket(response);
            if (response.ticket.response)
                setTicketResponse(response.ticket.response);
            setIsLoading(false)
        }

    }

    if (isLoading || !auth.currentUser?.displayName) {
        return <div>Loading...</div>
    }

    const handleDeleteDialog = (value: boolean) => {
        setIsDeleteDialogOpen(value);
    }

    const handleEditDialog = (value: boolean) => {
        setIsEditDialogOpen(value);
    }

    const handleUpdateDialog = () => {
        if (isStatusUpdateOpen)
            setIsStatusUpdateOpen(false)
    }

    const handleIsVersionOpen = (value: boolean) => {
        setIsVersionOpen(value);
    }

    const handleTicketUpdateById = async () => {
        if (!ticket) {
            throw new Error(`Invalid ticket data`);
        }

        if (!params.id) {
            throw new Error(`Invalid ticket id`);
        }

        if (!auth.currentUser?.displayName) {
            throw new Error(`Invalid ticket handler `);
        }

        if (!ticketResponse || ticketResponse.length < 9) {
            throw new Error(`Invalit ticket response. The response should be at least 10 characters long!`);
        }

        const formData: Ticket = {
            id: ticket.ticket.id,
            title: ticket.ticket.title,
            authorId: ticket.ticket.authorId,
            description: ticket.ticket.description,
            deadline: ticket.ticket.deadline,
            handlerId: ticket.ticket.handlerId,
            createdAt: ticket.ticket.createdAt,
            closedAt: ticket.ticket.closedAt,
            status: ticket.ticket.status,
            priority: ticket.ticket.priority,
            type: ticket.ticket.type,
            response: ticket.ticket.response,
            files: ticket.ticket.files,
            notified: ticket.ticket.notified,
        }

        const response = await updateTicketById(params.id, formData, auth.currentUser?.displayName);

        if (response) {
            console.log("updated response");
            isFetched.current = false;
        }
    }

    if (!ticket) {
        return <>Loading...</>
    }

    return (
        <div className='w-full px-5 lg:pl-10 my-6'>
        <div className='block lg:flex w-full'>
            <div className='block w-full lg:w-2/3'>
                <div className='w-full lg:w-5/6 bg-gray-50 rounded-md shadow-md p-2'>
                    <h1 className='text-lg font-semibold'>{ticket?.ticket.title}</h1>
                    <p 
                        className='my-2 text-md font-sans'
                        dangerouslySetInnerHTML={{ __html: ticket.ticket.description }}
                    />

                    <div className='flex my-2'>
                        {/* TODO: REPLACE WITH PICTURE */}
                        <img 
                            src={ticket.author.photoUrl}  
                            alt="dafault" 
                            className='w-8 rounded-full mr-4'
                        />
                        <h6 className='text-md font-semibold my-1'>{ticket.author.displayName}</h6>
                    </div>

                    <div className='flex'>    
                        {(auth.currentUser.uid === ticket?.ticket.handlerId || userRole === 'admin') &&
                            <button
                                onClick={() => setIsStatusUpdateOpen(!isStatusUpdateOpen)} 
                                className={
                                    `my-4 rounded-md border-2 border-blue-600 font-semibold
                                    text-blue-600 hover:text-white hover:bg-blue-600 px-2 mx-1`
                                }
                            >
                                Update status
                            </button>
                        }

                        {(auth.currentUser.displayName === ticket?.ticket.authorId || userRole === 'admin') &&
                            <button
                                onClick={() => setIsEditDialogOpen(!isEditDialogOpen)}
                                className={
                                    `my-4 rounded-md border-2 border-green-600 font-semibold
                                    text-green-600 hover:text-white hover:bg-green-600 px-2 mx-1`
                                }
                            >
                                Edit Ticket
                            </button>
                        }

                        {userRole === 'admin' &&
                            <button
                                onClick={() => handleDeleteDialog(!isDeleteDialogOpen)} 
                                className={
                                `my-4 rounded-md border-2 border-red-600 font-semibold
                                text-red-600 hover:text-white hover:bg-red-600 px-2 mx-1`
                            }>
                                Delete Ticket
                            </button>
                        }
                    </div>
                </div>

                <div className='w-full lg:w-5/6 bg-gray-50 rounded-md shadow-md p-2 my-8'>
                    {ticketsMenu.map((t, index) => (
                        <div
                            key={index} 
                            className='flex justify-between my-4'
                        >
                            <h1 className='text-md font-semibold text-gray-600'>
                                {t.text}
                            </h1>
                            <h1 className={
                                `text-md font-semibold rounded-md border-2 ${t.style} px-1`
                            }>
                                {t.value}
                            </h1>
                        </div>
                    ))}
                </div>
            </div>

            <div className='block w-full lg:w-3/4'>
                <div className='w-full lg:w-3/4 bg-gray-50 rounded-md shadow-md p-2'>
                    <h1 className='text-md lg:text-lg font-semibold my-4 mx-2'>Ticket Response:</h1>
                    <TextEditor 
                        value={ticketResponse}
                        onChange={setTicketResponse}
                        readonly={false}
                    />

                    <div className='flex justify-end mt-10 mb-4'>
                        <button
                            onClick={handleTicketUpdateById}
                            disabled={ticketResponse === '' ? true : false} 
                            className={`${ticketResponse === '' ? 'bg-emerald-400 text-gray-100' : 'bg-green-600 text-white'} rounded-md mr-5 p-2`}
                        >
                            Save changes
                        </button>
                    </div>
                </div>
    
                <FilesUpload 
                    ticketId={params.id}
                    author={auth.currentUser.displayName}
                    method={updateTicketById}
                    data={ticket.ticket}
                    type={"ticket"}
                    isFetched={isFetched}
                />

            </div>

            {/* Dialog Overlay */}
            {isStatusUpdateOpen && (
                <UpdateStatusDialog 
                    status={ticket.ticket.status}
                    onClose={handleUpdateDialog}
                    type={"ticket"}
                    options={statusUpdateMenu}
                    id={params.id}
                    ticket={ticket.ticket}
                    isFetched={isFetched}
                />
            )}

            {isEditDialogOpen && 
                <EditTicketDialog 
                    onClose={handleEditDialog}
                    ticketId={params.id}
                    ticketData={ticket.ticket}
                    isFetched={isFetched}
                />
            }

            {isDeleteDialogOpen && (
                <DeleteDialog 
                    onClose={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
                    type="ticket"
                    id={params.id}
                />
            )}

            </div>

            <div
                onClick={() => handleIsVersionOpen(!isVersionOpen)} 
                className='w-5/6 flex my-10 text-gray-500 font-semibold text-lg hover:bg-gray-50 cursor-pointer p-1'
            >
                <span className='my-4 lg:my-1.5'>
                    {isVersionOpen ? 
                        <IoIosArrowDown />:
                        <IoIosArrowForward />    
                    }
                </span>
                <h1 className='mx-4'>View ticket history</h1>
                <hr className='border border-gray-500 w-4/6 my-8 lg:my-4'/>
            </div>

            {
                isVersionOpen &&
                <TicketVersionsDetails isOpen={isVersionOpen} />
            }
        </div>
    );
};
