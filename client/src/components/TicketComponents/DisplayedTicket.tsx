import React, {useEffect, useState, useRef, useContext} from 'react'
import { getTicketsByUsername, getAllTickets } from '../../api/getTickets'
import { TicketObject } from '../../utils/interfaces/Ticket'
import { selectTickets } from './SelectTickets'
import Select, { SingleValue } from 'react-select'
import { selectStyles, customStyles } from '../../utils/Select-Styles'
import { TicketSearch } from './TicketSearch'
import { OrderTickets } from './OrderTickets'
import { TbArrowsDownUp ,TbArrowsUpDown } from "react-icons/tb"
import { handleTicketOrderChange } from './OrderTickets'
import { TicketDisplayNumber } from './TicketDisplayNumber'
import { TicketViewContainer } from './TicketViewContainer'
import { getAuth } from 'firebase/auth'
import { UserContext } from '../../context/UserProvider'

const displayOptions = [
  {label: "New", value: "New"},
  {label: "All", value: "All"},
  {label: "In progress", value: "In-Progress"},
  {label: "Completed", value: "Done"}
]

const ticketsSortOptions = [
  {label: "Title", value: "Title"},
  {label: "Deadline", value: "Deadline"},
  {label: "Priority", value: "Priority"}
]

const ticketViewNumberOptions = [
  {label: "5", value: 5},
  {label: "10", value: 10},
  {label: "25", value: 25},
  {label: "50", value: 50}
]


export const DisplayedTicket = () => {
  const {userRole, loading} = useContext(UserContext);
  const auth = getAuth();
  const isInitialMout = useRef(true)
  const [tickets, setTickets] = useState<TicketObject[]>([])
  const [displayedTickets, setDisplayedTickets] = useState<TicketObject[]>([])
  const [displayOption, setDisplayOption] = useState<{label: string, value: string}>(displayOptions[0])
  const [displayOrder, setDisplayOrder] = useState<string>('asc')
  const [orderValue, setOrderValue] = useState<string>('Title')
  const [ticketsNumberDisplayed, setTicketsNumberDisplayed] = useState<number>(5)

  useEffect(() => {
    if (isInitialMout.current && !loading) {
      isInitialMout.current = false
      fetchUserTickets()
    }
  }, [loading])


  const fetchUserTickets = async () => {
    try {
      if (!auth.currentUser || !auth.currentUser.displayName) {
        throw new Error("Error! Unautorized user! Please login!");
      }

      let response;

      if (userRole?.toLowerCase() === "admin") {
        response = await getAllTickets();
        console.log("Fetched as admin");
      } else {
        console.log("Fetched as user");
        response = await getTicketsByUsername(auth.currentUser.displayName);
      }

      
      if (response) {
        console.log(response)
        setTickets(selectTickets(response, "all"))
        setDisplayedTickets(selectTickets(response, "all"))
      }
    } catch (error) {
      console.error("Faild to fetch tickets: " + error)
    }
  }

  const handleOptionChange = (option: SingleValue<{label: string, value: string}>) => {
    if (option) {
      setDisplayedTickets(selectTickets(tickets, option.label))
      setDisplayOption({label: option.label, value: option.value})
    } 
    // TODO: DISPLAY ERROR MESSAGE CARD FOR UNDEFINED
  }

  const handleDisplayedTicketsChange = (tickets: TicketObject[], text: string) => {
    if (text === '') {
       handleOptionChange(displayOption)
    } else {
      setDisplayedTickets(tickets)
    }
  }

  const handleOrderTicketsChange = (tickets: TicketObject[]) => {
    setDisplayedTickets(tickets)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className='w-full block '>

      <div className='flex '>
        <Select 
          options={displayOptions}
          styles={{...selectStyles("#cbd5e1", "#000"), ...customStyles}}
          className='w-1/5 z-10 relative outline-none focus:outline-none'
          value={displayOption}
          placeholder={"Display tickets..."}
          onChange={(e) => handleOptionChange}
        />

        <TicketSearch 
          tickets={displayedTickets}
          displayTickets={handleDisplayedTicketsChange}
        />

        <OrderTickets 
          options={ticketsSortOptions}
          items={displayedTickets}
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
              handleOrderTicketsChange(handleTicketOrderChange(orderValue, displayedTickets, displayOrder === 'asc' ? 'desc' : 'asc'))
            }}
          className='p-2 border border-gray-800 rounded-md justify-center text-center items-center mx-2'
        >
          {
            displayOrder === 'asc' ? <TbArrowsUpDown /> : <TbArrowsDownUp />
          }
        </button>

        <TicketDisplayNumber 
          items={displayedTickets}
          options={ticketViewNumberOptions}
          styles={{...selectStyles("#cbd5e1", "#000"), ...customStyles}}
          viewStyle={'w-1/12 z-10 relative outline-none focus:none'}
          setItemsNumbers={(value:number) => setTicketsNumberDisplayed(value)}
        /> 
      </div>

        <TicketViewContainer 
            items={displayedTickets}
            itemsNumber={ticketsNumberDisplayed}
        /> 
    </div>
  )
}
