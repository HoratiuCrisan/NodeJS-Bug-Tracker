import React, { useState, useEffect, useContext, FormEvent, MutableRefObject } from 'react';
import Select from 'react-select';
import { TextEditor } from '../TextEditor';
import { getUsers } from '../../api/users';
import { UserContext } from '../../context/UserProvider';
import { updateTicketById } from '../../api/tickets';
import { ticketPriorityOptions, ticketTypeOptions } from '../../utils/selectOptions';
import { useCan } from '../../hooks/useCan';
import { Ticket } from '../../types/Ticket';
import { User } from '../../types/User';

interface EditTicketDialogFormProps {
  onClose: (value: boolean) => void;
  ticketId: string | undefined;
  ticketData: Ticket | undefined;
  isFetched: MutableRefObject<boolean>;
}

export const EditTicketDialogForm: React.FC<EditTicketDialogFormProps> = ({
  onClose,
  ticketId,
  ticketData,
  isFetched,
}) => {
  const { user } = useContext(UserContext);
  const canUpdateTicketHandler = useCan('updateTicketHandler');

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    Title: ticketData?.title || '',
    Description: ticketData?.description || '',
    Priority: ticketData?.priority || '',
    Type: ticketData?.type || '',
    Handler: ticketData?.handlerId || '',
    Deadline: ticketData?.deadline || Date.now(),
  });

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    const response = await getUsers('displayName', 'asc', 10, undefined);
    if (response) {
      const filtered = response.filter((u) => u.role !== 'user');
      setUsers(filtered);
    }
  };

  const handleTicketForm = (attribute: string, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [attribute]: value,
    }));
  };

  const handleTicketUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticketId || !user || !ticketData) return;

    const updatedTicket: Ticket = {
      ...ticketData,
      title: formData.Title,
      description: formData.Description,
      priority: formData.Priority,
      type: formData.Type,
      handlerId: formData.Handler,
      deadline: typeof formData.Deadline === 'string'
        ? new Date(formData.Deadline).getTime()
        : formData.Deadline,
    };

    const response = await updateTicketById(ticketId, updatedTicket);
    if (response) {
      console.log('Updated ticket');
      isFetched.current = false;
      onClose(false);
      // Ideally trigger refetch via state/context instead of full reload:
      window.location.reload();
    }
  };

  if (!ticketData) return <>Loading...</>;

  return (
    <form className="block">
      {/* Title */}
      <label htmlFor="ticket-title" className="text-gray-800 text-lg">
        Title:
        <input
          id="ticket-title"
          name="ticket-title"
          type="text"
          placeholder="Title..."
          value={formData.Title}
          onChange={(e) => handleTicketForm('Title', e.target.value)}
          className="block w-full lg:w-2/3 text-slate-600 text-md border border-gray-800 rounded-md my-2 lg:mx-2 px-2 py-1"
        />
      </label>

      {/* Type & Priority */}
      <div className="block lg:flex">
        <label htmlFor="ticket-type" className="w-2/6 mx-2">
          Type:
          <Select
            options={ticketTypeOptions}
            value={{ label: formData.Type, value: formData.Type }}
            onChange={(e) => handleTicketForm('Type', e?.value)}
            className="w-full my-2"
          />
        </label>

        <label htmlFor="ticket-priority" className="w-2/6 mx-2">
          Priority:
          <Select
            options={ticketPriorityOptions}
            value={{ label: formData.Priority, value: formData.Priority }}
            onChange={(e) => handleTicketForm('Priority', e?.value)}
            className="w-full my-2"
          />
        </label>
      </div>

      {/* Description */}
      <label htmlFor="ticket-description" className="text-gray-800 text-lg mx-4">
        Description:
        <TextEditor
          value={formData.Description || 'No description...'}
          onChange={(value) => handleTicketForm('Description', value)}
          readonly={false}
          classname="mx-2 mb-4"
        />
      </label>

      {/* Deadline */}
      <label htmlFor="ticket-deadline">
        <span className="text-lg">Deadline:</span>
        <input
          type="date"
          id="ticket-deadline"
          name="ticket-deadline"
          value={
            typeof formData.Deadline === 'number'
              ? new Date(formData.Deadline).toISOString().split('T')[0]
              : formData.Deadline
          }
          onChange={(e) => handleTicketForm('Deadline', e.target.value)}
          className="block w-1/3 border-2 border-gray-400 rounded-md text-gray-500 px-2 mx-4 mb-6 mt-2 py-0.5"
        />
      </label>

      {/* Buttons */}
      <div className="flex w-full justify-end">
        <button
          type="button"
          onClick={() => onClose(false)}
          className="w-1/2 md:w-1/3 bg-red-500 hover:bg-red-600 text-gray-200 hover:text-gray-300 rounded-md px-1 py-2 mx-2"
        >
          Discard
        </button>
        <button
          type="submit"
          onClick={handleTicketUpdate}
          className="w-1/2 md:w-1/3 bg-emerald-500 hover:bg-emerald-600 text-gray-200 hover:text-gray-300 rounded-md px-1 py-2 mx-2"
        >
          Submit
        </button>
      </div>
    </form>
  );
};
