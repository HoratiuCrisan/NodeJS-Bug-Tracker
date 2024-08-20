import React from 'react'
import {FaRegEnvelope} from 'react-icons/fa'
import { TicketContainer } from './TicketFormContainer'

export const NewTicket = () => {
  return (
    <div className='block'>
        <div className='flex font-semibold text-xl'>
            <span className='text-2xl mt-1 mr-2'>
                <FaRegEnvelope />
            </span>
            <h1>Create Ticket</h1>    
        </div>

        <div className='shadow-2xl mx-auto p-2 w-9/12 my-8'>
          <TicketContainer />
        </div>
    </div>
  )
}
