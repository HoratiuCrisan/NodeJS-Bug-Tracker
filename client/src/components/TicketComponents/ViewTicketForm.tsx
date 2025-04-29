import React from 'react'
import {FaRegEnvelope} from 'react-icons/fa'
import { ViewTicketContainer } from './ViewTicketFormContainer'
import { TicketProps } from '../../utils/types/Ticket'

export const ViewTicketForm: React.FC<TicketProps> = ({ticket}) => {
  return (
    <div className='block'>
        <div className='flex font-semibold text-xl'>
            <span className='text-2xl mt-1 mr-2'>
                <FaRegEnvelope />
            </span>
            <h1>Create Ticket</h1>    
        </div>

        <div className='shadow-2xl mx-auto p-2 w-9/12 my-8'>
          <ViewTicketContainer ticket={ticket}/>
        </div>
    </div>
  )
}
