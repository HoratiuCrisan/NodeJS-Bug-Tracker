import React from 'react'
import { Ticket, TicketCardType } from '../../types/Ticket'
import { useNavigate } from 'react-router-dom'

interface TicketProps {
    ticket: TicketCardType
}

const parsePriorityColor = (text: string) => {
    switch (text.toLowerCase()) {
      case "low":
        return <h1 className='text-green-400 font-bold'>{text}</h1>
      case "medium": 
        return <h1 className='text-blue-500 font-bold'>{text}</h1>
      case "high":
        return <h1 className='text-orange-500 font-bold'>{text}</h1>
      case "urgent":
        return <h1 className='text-red-700 font-bold'>{text}</h1>
      default:
        break;
    }
}

export const TicketCard: React.FC<TicketProps> = ({ticket}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)} 
      className='w-full bg-white font-semibold rounded-md shadow-xl border border-gray-400 hover:border-2 hover:border-gray-600 cursor-pointer mr-6 my-4 p-4'>
        <h1 className='my-2'>
          {ticket.title}
        </h1>
        <span className='my-2'>
          {parsePriorityColor(ticket.priority)}
        </span>
        <h1 className='my-2 text-gray-600'>
          {ticket.deadline}
        </h1>
        <div className='flex items-center'>
          <h1 className='my-2'>{ticket.status.split('-').join(' ')}</h1>
          <img src={ticket.authorPhoto} alt="author" className='rounded-full w-8 ml-auto'/> 
        </div>
    </div>
  )
}
