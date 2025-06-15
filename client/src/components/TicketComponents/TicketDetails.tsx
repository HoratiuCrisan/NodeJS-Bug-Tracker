import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getUserTicketById } from '../../api/tickets';
import { Ticket, TicketObject } from '../../types/Ticket';
import { UpdateStatusDialog } from '../UpdateStatusDialog';
import { DeleteDialog } from '../DeleteDialog';
import { FilesUpload } from '../FilesUpload';
import { updateTicketById } from '../../api/tickets';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { TicketVersionsDetails } from './TicketVersionsDetails';
import { EditTicketDialog } from './EditTicketDialog';
import { UserContext } from '../../context/UserProvider';
import {statusUpdateMenu} from "../../utils/selectOptions";
import { useCan } from '../../hooks/useCan';
import { User } from '../../types/User';
import { TicketResponse } from './TicketResponse';
import dayjs from 'dayjs';
import { AssignTicketDialog } from './AssignTicketDialog';
import defaultPhoto from "../../Images/default-user-photo.svg";

export const TicketDetails = () => {
    const {loading, user} = useContext(UserContext);
    const {ticketId} = useParams();
    const isFetched = useRef<boolean>(false);
    const [ticketCard, setTicketCard] = useState<TicketObject | undefined>(undefined);
    const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState<boolean>(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [isVersionOpen, setIsVersionOpen] = useState<boolean>(false);
    const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
    const canUpdateStatus = useCan("updateTicketStatus", ticketCard?.ticket);
    const canEditTicket = useCan("editTicket", ticketCard?.ticket);
    const canDeleteTicket = useCan("deleteTicket", ticketCard?.ticket);
    const canAssignTicket = useCan("assignTicket");

    const ticketsMenu = [
        {text: "Created at", value: dayjs(ticketCard?.ticket.createdAt).format("DD/MM/YY hh:mm A"), style: 'text-teal-700 border-teal-700 hover:bg-teal-700 hover:text-white'},
        {text: "Deadline", value: dayjs(ticketCard?.ticket.deadline).format("DD/MM/YY hh:mm A"), style: 'text-green-600 border-green-600 hover:bg-green-600 hover:text-white'},
        {text: "Type", value: ticketCard?.ticket.type, style: 'text-yellow-600 border-yellow-600 hover:bg-yellow-600 hover:text-white'},
        {text: "Priority", value: ticketCard?.ticket.priority, style: 'text-red-600 border-red-600 hover:bg-red-600 hover:text-white'},
        {text: "Status", value: ticketCard?.ticket.status, style: 'text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'},
    ];
    
    useEffect(() => {   
        const fetchTicketData = async (usr: User, tid: string) => {
            try {
                const response: TicketObject = await getUserTicketById(usr.id, tid);

                setTicketCard(response);
            } catch (error) {
                return;
            }
        }

        if (user && ticketId) {
            fetchTicketData(user, ticketId);
        }
    }, [user, ticketId]);

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

    const handleIsAssignOpen = (value: boolean) => {
        setIsAssignOpen(value);
    }

  
    if (loading || !user || !ticketId || !ticketCard) {
        return <div>Loading...</div>
    }

    return (
        <div className='w-full px-5 lg:pl-10 my-6'>
        <div className='block lg:flex w-full'>
            <div className='block w-full lg:w-2/3'>
                <div className='w-full lg:w-5/6 bg-gray-50 rounded-md shadow-md p-2'>
                    <h1 className='text-lg font-semibold'>{ticketCard.ticket.title}</h1>
                    <p 
                        className='my-2 text-md font-sans'
                        dangerouslySetInnerHTML={{ __html: ticketCard.ticket.description }}
                    />

                    <div className='flex my-2'>
                        <img 
                            src={ticketCard.author.photoUrl}  
                            alt="dafault" 
                            className='w-8 rounded-full mr-4'
                        />
                        <h6 className='text-md font-semibold my-1'>{ticketCard.author.displayName}</h6>
                    </div>

                    <div className='flex'>    
                            {canAssignTicket &&
                                <button
                                    onClick={() => handleIsAssignOpen(!isAssignOpen)}
                                    className={
                                        `my-4 rounded-md border-2 border-yellow-600 font-semibold
                                        text-yellow-600 hover:text-white hover:bg-yellow-600 px-2 mx-1`
                                    }
                                >
                                    Asssign ticket
                                </button>
                            }

                        {canUpdateStatus &&
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

                        {canEditTicket &&
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

                        {canDeleteTicket &&
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
                {ticketCard.handler && user.id !== ticketCard.handler.id && 
                    <div className="w-full lg:w-3/4 bg-gray-50 rounded-md shadow-md p-2 mb-4">
                        <div className='flex flex-col w-full mx-auto justify-center items-center'>
                            <img 
                                src={ticketCard.handler.photoUrl ?? defaultPhoto} 
                                onError={(e) => e.currentTarget.src=`${defaultPhoto}`}
                                alt="handler profile" 
                                className="rounded-full w-14 h-14"
                            />
                            <h1 className="font-medium text-slate-600">
                                {ticketCard.handler.displayName}
                            </h1>
                            <a 
                                href={`https://mail.google.com/mail/?view=cm&to=${ticketCard.handler.email}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800 font-mono"
                            >
                                {ticketCard.handler.email}
                            </a>
                        </div>
                    </div>
                }
                {(canUpdateStatus || ticketCard.ticket.response) &&
                    <TicketResponse 
                        ticket={ticketCard.ticket}
                    />
                }
    
                <FilesUpload 
                    ticketId={ticketId}
                    author={user.displayName}
                    method={updateTicketById}
                    data={ticketCard.ticket}
                    type={"ticket"}
                    isFetched={isFetched}
                />
            </div>

            {/* Dialog Overlay */}
            {isStatusUpdateOpen && (
                <UpdateStatusDialog 
                    defaultStatus={ticketCard.ticket.status}
                    onClose={handleUpdateDialog}
                    options={statusUpdateMenu}
                    ticket={ticketCard.ticket}
                    isFetched={isFetched}
                />
            )}

            {isEditDialogOpen && 
                <EditTicketDialog 
                    onClose={handleEditDialog}
                    ticketId={ticketId}
                    ticketData={ticketCard.ticket}
                    isFetched={isFetched}
                />
            }

            {isDeleteDialogOpen && (
                <DeleteDialog 
                    onClose={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
                    type="ticket"
                    id={ticketId}
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
                <TicketVersionsDetails 
                    isOpen={isVersionOpen}
                    ticketId={ticketCard.ticket.id} 
                />
            }

            {
                isAssignOpen &&
                <AssignTicketDialog onClose={handleIsAssignOpen} ticket={ticketCard.ticket}/>
            }
        </div>
    );
};
