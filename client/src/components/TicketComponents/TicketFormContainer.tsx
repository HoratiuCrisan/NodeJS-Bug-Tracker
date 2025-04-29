import React, { useState, useEffect } from 'react';
import { TicketForm } from './TicketForm';
import { createTicket } from '../../api/createTicket';
import { useAuth } from '../../config/AuthContext';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { TicketFormData } from '../../utils/types/Ticket';

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

export const TicketContainer = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<null | string>(null);
  const [formData, setFormData] = useState<TicketFormData>(() => {
    const savedFormData = auth.currentUser ?
        localStorage.getItem(`ticketFormData_${auth.currentUser.uid}`)
        : null;
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          title: '',
          description: '',
          priority: {
            value: '',
            label: '',
          },
          type: {
            value: '',
            label: '',
          },
          deadline: new Date().toISOString().split('T')[0],
        };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (auth.currentUser) {
        localStorage.setItem(
            `ticketFormData_${auth.currentUser.uid}`, 
            JSON.stringify(formData)
        );
    }
  }, [formData, auth.currentUser]);

  const handleInputChange = (
    value: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | undefined,
    type: string
  ) => {
    switch (type) {
      case 'title':
        setFormData((prevFormData) => ({
          ...prevFormData,
          title: value ? value.toString() : '',
        }));
        break;
      case 'description':
        setFormData((prevFormData) => ({
          ...prevFormData,
          description: value ? value.toString() : '',
        }));
        break;
      case 'priority':
        setFormData((prevFormData) => ({
          ...prevFormData,
          priority: {
            value: value ? value.toString() : '',
            label: value ? value.toString() : '',
          },
        }));
        break;
      case 'type':
        setFormData((prevFormData) => ({
          ...prevFormData,
          type: {
            value: value ? value.toString() : '',
            label: value ? value.toString() : '',
          },
        }));
        break;
      case 'deadline':
        if (typeof value === 'string') {
          setFormData((prevFormData) => ({
            ...prevFormData,
            deadline: value,
          }));
        }
        break;
    }
  };

  const handleErrors = () => {
    if (formData.title.length < 5) {
      setFormError('Title must be at least 5 characters long!');
      return false;
    } else if (formData.description.length < 10) {
      setFormError('Description must be at least 10 characters long!');
      return false;
    } else if (formData.priority.label === '') {
      setFormError('Select the desired priority for your ticket!');
      return false;
    } else if (formData.type.label === '') {
      setFormError('Select the desired type for your ticket!');
      return false;
    } else if (formData.deadline.toString().length <= 0) {
      setFormError('Please select a deadline!');
      return false;
    }

    return true;
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = handleErrors();

    if (result) {
      await createTicket({
        formData,
        author: auth.currentUser?.displayName,
        authorPicture: auth.currentUser?.photoURL,
      });
      
      if (auth.currentUser) {
        localStorage.removeItem(`ticketFormData_${auth.currentUser.uid}`);
      }
      navigate('/');
    }
  };

  return (
    <TicketForm
      formData={formData}
      formError={formError}
      priority={priorityOptions}
      type={ticketTypeOptions}
      onSubmit={handleTicketSubmit}
      onInputChange={handleInputChange}
    />
  );
};
