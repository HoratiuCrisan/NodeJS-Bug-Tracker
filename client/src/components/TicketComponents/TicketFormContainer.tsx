import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import { TicketForm } from './TicketForm';
import { createTicket } from '../../api/tickets';
import { ticketPriorityOptions, ticketTypeOptions } from '../../utils/selectOptions';
import { UserContext } from '../../context/UserProvider';
import { useNavigate } from 'react-router-dom';
import { TicketFormDataType } from '../../types/Ticket';

const defaultFormData = {
	title: "",
	description: "",
	priority: { value: "", label: "" },
	type: { value: "", label: "" },
	deadline: Date.now(),
};


export const TicketContainer = () => {
	const { loading, user } = useContext(UserContext);
	const navigate = useNavigate();

	const [formError, setFormError] = useState<null | string>(null);
	const [formData, setFormData] = useState<TicketFormDataType>(defaultFormData);

	useEffect(() => {
		if (!user) return;

		const draftKey = `ticketFormData_${user.id}`;
		const storedDraft = localStorage.getItem(draftKey);

		if (storedDraft) {
			setFormData(JSON.parse(storedDraft));
		} else {
			localStorage.setItem(draftKey, JSON.stringify(defaultFormData));
		}
	}, [user]);

	useEffect(() => {
		if (!user) return;

		const draftKey = `ticketFormData_${user.id}`;
		localStorage.setItem(draftKey, JSON.stringify(formData));
	}, [formData, user]);

	const handleInputChange = (
		value: string | number | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | undefined,
		field: keyof TicketFormDataType
	) => {
		let inputValue: string | number;

		if (typeof value === 'string' || typeof value === 'number') {
			inputValue = value;
		} else {
			inputValue = value?.target?.value ?? '';
		}

		if (field === 'priority' || field === 'type') {
			setFormData(prev => ({
			...prev,
			[field]: {
				value: inputValue.toString(),
				label: inputValue.toString(),
			},
			}));
		} else {
			setFormData(prev => ({
			...prev,
			[field]: inputValue,
			}));
		}
	};


	const handleTicketSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			setFormError(null);

			await createTicket(
				formData.title, 
				formData.description, 
				formData.priority.value, 
				formData.type.value, Number(formData.deadline)
			);
			
			localStorage.removeItem(`ticketFormData_${user?.id}`);
			
			navigate('/');
		} catch (error) {

		}
		
	};

	if (loading || !user) {
		return <>Loading...</>
	}

	return (
		<TicketForm
			formData={formData}
			formError={formError}
			priority={ticketPriorityOptions}
			type={ticketTypeOptions}
			onSubmit={handleTicketSubmit}
			onInputChange={handleInputChange}
		/>
	);
};
