import React, {useState, useEffect, useContext, FormEvent, MutableRefObject} from 'react'
import { Ticket } from '../../utils/types/Ticket';
import Select from 'react-select';
import { TextEditor } from '../TextEditor';
import { getAllUsers } from '../../api/users';
import { UserContext } from '../../context/UserProvider';
import { User } from '../../utils/types/User';
import { updateTicketById } from '../../api/tickets';
import { getAuth } from 'firebase/auth';

interface EditTicketDialogFormProps {
    onClose: (value: boolean) => void;
    ticketId: string | undefined;
    ticketData: Ticket | undefined;
    isFetched: React.MutableRefObject<boolean>;
}

const priorityOptions = [
    {
      value: 'low',
      label: 'Low',
    },
    {
      value: 'medium',
      label: 'Medium',
    },
    {
      value: 'high',
      label: 'High',
    },
    {
      value: 'urgent',
      label: 'Urgent',
    },
  ];
  
  const ticketTypeOptions = [
    {
      value: 'bug',
      label: 'Bug',
    },
    {
      value: 'feature',
      label: 'Feature',
    },
  ];

export const EditTicketDialogForm: React.FC<EditTicketDialogFormProps> = ({onClose ,ticketId, ticketData, isFetched}) => {
    const auth = getAuth();
    const { userRole } = useContext(UserContext);
    const [users, setUsers] = useState<User[]>([]);
    const [handlerOptions, setHandlerOptions] = useState<{label: string, value: string}[] >()
    const [formData, setFormData] = useState({
        Title: ticketData ? ticketData.title : '',
        Description: ticketData ? ticketData.description : '',
        Priority: ticketData? ticketData.priority : '',
        Type: ticketData? ticketData.type : '',
        Handler: ticketData ? ticketData.handlerId : '',
        Deadline: ticketData ? ticketData.deadline : ''
    });

    useEffect(() => {
        if (auth.currentUser) {
            fetchUsers();
        }
    }, [auth]);

    const fetchUsers = async () => {
        const response = await getAllUsers();

        if (response) {
            const users: User[] = response.users;
            const filteredUsers = users.filter(user => user.role !== 'user' && user.displayName !== ticketData?.authorId);
            console.log(filteredUsers);
            setUsers(filteredUsers);
            setHandlerOptions(filteredUsers.map((user) => {
                return {label: user.displayName, value: user.displayName}
            }))
        }
    };


    const handleTicketForm = (attribute: string, value: string | undefined) => {
        setFormData(prevState => ({
            ...prevState,
            [attribute] : value
        }))
    };

    const handleTicketUpdate = async (e: FormEvent) => {
        e.preventDefault();

        if (!ticketId) {
            return;
        }

        if (!auth.currentUser) {
            return;
        }

        const selectedHandler = users.find(user => {
            if (user.displayName === formData.Handler)
                return user.id;
        });

        if (!selectedHandler) {
            throw new Error("User not found");
        }

        if (!ticketData) {
            return;
        }

        const updatedTicket: Ticket = {
            id: ticketData.id,
            title: formData.Title,
            description: formData.Description,
            authorId: ticketData.authorId,
            status: ticketData.status,
            priority: formData.Priority,
            type: formData.Type,
            response: ticketData.response,
            createdAt: ticketData.createdAt,
            closedAt: ticketData.closedAt,
            handlerId: selectedHandler.id,
            files: ticketData.files,
            deadline: Date.now(),
            notified: ticketData.notified,
        }

        console.log(updatedTicket);

        const response = await updateTicketById(ticketId, updatedTicket, auth.currentUser?.email);

        if (response) {
            console.log('updated ticket');
            isFetched.current = false;
            onClose(false);
        }
    }


    if (!ticketData) {
        return <>Loading...</>
    }


    return (
        <form className='block'>
            <label 
                htmlFor="ticket-title"
                className='text-gray-800 text-lg'
            >
                Title:
                <input 
                    id='ticket-title' 
                    name='ticket-title' 
                    type="text" 
                    placeholder='Title...'
                    value={formData.Title || ''}
                    onChange={(e) => handleTicketForm("Title" ,e.target.value)}
                    className='block w-full lg:w-2/3 text-slate-600 text-md border border-gray-800 rounded-md my-2 lg:mx-2 px-2 py-1'
                />
            </label>

            <div className='block lg:flex'>
                <label htmlFor="ticket-type" className='w-2/6 mx-2'>
                    Type:
                    <Select 
                        options={ticketTypeOptions}
                        value={{label: formData.Type, value: formData.Type}}
                        onChange={(e) => handleTicketForm("Type", e?.label)}
                        className='w-full my-2'
                    />
                </label>

                <label htmlFor="ticket-priority" className='w-2/6 mx-2'>
                    Priority:
                    <Select 
                        options={priorityOptions}
                        value={{label: formData.Priority, value: formData.Priority}}
                        onChange={(e) => handleTicketForm("Priority", e?.label)}
                        className='w-full my-2'
                    />
                </label>

                {userRole === 'admin' &&
                    <label htmlFor="ticket-handler" className='w-2/6 mx-2'>
                        Handler:
                        <Select
                            placeholder='Ticket handler...'
                            options={handlerOptions}
                            value={{label: formData.Handler, value: formData.Handler}}
                            onChange={(e) => handleTicketForm("Handler", String(e?.label))}
                            className='my-2'
                        />
                    </label>
                }
            </div>

            <label 
                htmlFor="ticket-description"
                className='text-gray-800 text-lg mx-4'
            >
                Description:
                <TextEditor 
                    value={formData.Description ? formData.Description : 'No description...'}
                    onChange={(e) => handleTicketForm("Description", e)}
                    readonly={false}
                    classname='mx-2 mb-4'
                />
            </label>
            
            <label htmlFor="ticket-deadline">
                <span className='text-lg'>Deadline:</span>
                <input 
                    type="date"
                    id="ticket-deadline"
                    name='ticket-deadline'
                    value={formData.Deadline}
                    onChange={(e) => handleTicketForm("Deadline", e.target.value)}
                    className='block w-1/3 border-2 border-gray-400 rounded-md text-gray-500 px-2 mx-4 mb-6 mt-2 py-0.5' 
                />
            </label>
            
            <div className='flex w-full justify-end'>
                <button
                    onClick={() => onClose(false)} 
                    className={
                        `w-1/2 md:w-1/3 bg-red-500 hover:bg-red-600 text-gray-200 
                        hover:text-gray-300 rounded-md px-1 py-2 mx-2`
                    }
                >
                    Discard
                </button>

                <button
                    onClick={handleTicketUpdate} 
                    className={`
                        w-1/2 md:w-1/3 bg-emerald-500 hover:bg-emerald-600 
                        text-gray-200 hover:text-gray-300 rounded-md px-1 py-2 mx-2`
                    }>
                    Submit
                </button>
            </div>
        </form>
    )
}
