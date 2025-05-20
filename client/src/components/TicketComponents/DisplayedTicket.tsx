import React, {useEffect, useState, useRef, useContext} from 'react'
import { getUserTickets, getAllTickets } from '../../api/tickets'
import { TicketCardType } from '../../types/Ticket'
import Select, { SingleValue } from 'react-select'
import { selectStyles, customStyles } from '../../utils/Select-Styles'
import { TicketSearch } from './TicketSearch'
import { OrderTickets } from './OrderTickets'
import { TbArrowsDownUp ,TbArrowsUpDown } from "react-icons/tb"
import { handleTicketOrderChange } from './OrderTickets'
import { TicketViewContainer } from './TicketViewContainer'
import { ticketsSortOptions, displayTicketOptions } from "../../utils/selectOptions";
import { UserContext } from '../../context/UserProvider'


export const DisplayedTicket = () => {
	const {user, loading} = useContext(UserContext);
	const [tickets, setTickets] = useState<TicketCardType[]>([]);
	const [displayOption, setDisplayOption] = useState<{label: string, value: string}>(displayTicketOptions[0])
	const [displayOrder, setDisplayOrder] = useState<string>('asc');
	const [orderValue, setOrderValue] = useState<string>('title');
	const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

	useEffect(() => {
		
	}, [user]);

	const handleOptionChange = (option: SingleValue<{label: string, value: string}>) => {
		if (option) {
			setDisplayOption({label: option.label, value: option.value})
		} 
	}

  	const handleDisplayedTicketsChange = (tickets: TicketCardType[], text: string) => {
		if (text === '') {
		handleOptionChange(displayOption)
		} 
  	}

	const handleOrderTicketsChange = (tickets: TicketCardType[]) => {
		setTickets(tickets)
	}

	if (loading || !user) {
		return <div>Loading...</div>
	}

	return (
		<div className='w-full block'>
			<div className='flex '>
				<TicketSearch 
					tickets={tickets}
					displayTickets={handleDisplayedTicketsChange}
				/>
				<Select 
					options={displayTicketOptions}
					styles={{...selectStyles("#cbd5e1", "#000"), ...customStyles}}
					className='w-1/5 z-10 relative outline-none focus:outline-none mr-4'
					value={displayOption}
					onChange={(e) => handleOptionChange}
				/>

			
				<OrderTickets 
					options={ticketsSortOptions}
					items={tickets}
					setItems={handleOrderTicketsChange}
					setOrderValue={(value: string) => setOrderValue(value)}
					orderStyle={'w-1/5 z-10 relative outline-none focus:outline-none'}
					styles={{...selectStyles("#cbd5e1", "#000"), ...customStyles}}
					order={displayOrder}
				/>   

				<button
					onClick={() => 
						{
						setDisplayOrder(displayOrder === 'asc' ? 'desc' : 'asc'); 
						handleOrderTicketsChange(handleTicketOrderChange(orderValue, tickets, displayOrder === 'asc' ? 'desc' : 'asc'))
						}}
					className='p-2 border border-gray-800 rounded-md justify-center text-center items-center mx-2 bg-white'
				>
				{
					displayOrder === 'asc' ? <TbArrowsUpDown /> : <TbArrowsDownUp />
				}
				</button>
			</div>

			<TicketViewContainer 
				limit={10}
				order={orderValue}
				orderDirection={displayOrder}
				searchQuery={searchQuery}
				priority={undefined}
				status={undefined}
			/>
		</div>
	)
}
