import React, { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import { IoCloseOutline } from 'react-icons/io5';
import { Ticket } from '../../types/Ticket';
import { getUserById, getNonUsers } from '../../api/users';
import { User } from '../../types/User';
import { assignTicket, updateTicketById } from '../../api/tickets';
import { UserContext } from '../../context/UserProvider';

type AssignTicketDialogType = {
    ticket: Ticket;
    onClose: (value: boolean) => void;
};

type OptionType = {
    value: string;
    label: string;
};

export const AssignTicketDialog: React.FC<AssignTicketDialogType> = ({ onClose, ticket }) => {
    const {user} = useContext(UserContext);
    const [handler, setHandler] = useState<OptionType>({ value: '', label: '' });
    const [userOptions, setUserOptions] = useState<OptionType[]>([]);

    useEffect(() => {
        const fetchHandlerData = async (id: string) => {
            try {
                const response: User = await getUserById(id);
                setHandler({ value: response.id, label: response.email });
            } catch (error) {
                console.error('Failed to fetch handler:', error);
            }
        };

        const fetchNonUsers = async () => {
            try {
                const response: User[] = await getNonUsers();
                const options = response.map((u) => ({ value: u.id, label: u.email })).filter((r) => r.value !== handler.value);
                setUserOptions(options);
            } catch (error) {
                console.error('Failed to fetch non-users:', error);
            }
        };

        if (ticket.handlerId) {
            fetchHandlerData(ticket.handlerId);
        } else {
            setHandler({ value: '', label: '' });
        }

        fetchNonUsers();
    }, [ticket.handlerId]);

    const onChangeHandler = (option: OptionType | null) => {
        if (option) {
            setHandler(option);
        }
    };

    const handleAssignTicket = async () => {
        if (!user) return;
        try {
            await assignTicket(ticket.id, handler.value, handler.label, user.email);

            onClose(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            return;
        }
    }

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 overflow-y-auto'>
            <div className='w-full md:w-5/6 lg:w-3/6 bg-gray-50 p-4 rounded-lg shadow-lg'>
                <div className='flex justify-end'>
                    <IoCloseOutline
                        onClick={() => onClose(false)}
                        className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                        size={24}
                    />
                </div>

                <h1 className='py-4 font-semibold text-lg'>Handler:</h1>
                <Select
                    value={handler.value ? handler : null}
                    options={userOptions}
                    onChange={onChangeHandler}
                    placeholder='Select a handler...'
                />

                <div className="flex justify-end items-end gap-2 mt-8 bottom-0">
                    <button
                        onClick={() => onClose(false)}
                        className="bg-red-500 hover:bg-red-600 rounded-md text-white hover:text-gray-200 p-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => handleAssignTicket()}
                        className="bg-emerald-500 hover:bg-emerald-600 rounded-md text-white hover:text-gray-200 p-2"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};
