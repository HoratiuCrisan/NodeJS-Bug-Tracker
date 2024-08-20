import React, {useState, useEffect} from 'react'
import { FaSearch } from "react-icons/fa"
import { TicketObject } from '../../utils/interfaces/Ticket'

interface TicketsProps {
    tickets: TicketObject[]
    displayTickets: (tickets: TicketObject[], text: string) => void 
}

export const TicketSearch:React.FC<TicketsProps> = ({tickets, displayTickets}) => {
    const handleSearchChange = (text: string) => {
        
        const filteredTickets = tickets.filter(t => t.data.Title.toLowerCase().match(text))

        displayTickets(filteredTickets, text)
    }

    return (
        <div className="relative w-1/4 mx-4">
            <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full p-1.5 px-2 rounded-md border border-gray-800 focus:outline-none focus:border-2"
            />
            <div className="absolute inset-y-0 right-0.5 flex items-center cursor-pointer">
            <div className='bg-gray-100 rounded-md p-2.5 cursor-pointer'>
                <FaSearch />
            </div>
            </div>
        </div>
    )
}
