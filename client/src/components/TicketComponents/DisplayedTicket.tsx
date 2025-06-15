import React, { useState, useContext } from 'react'
import Select, { SingleValue } from 'react-select'
import { TbArrowsDownUp, TbArrowsUpDown } from 'react-icons/tb'

import { TicketCardType } from '../../types/Ticket'
import { TicketSearch } from './TicketSearch'
import { OrderTickets, handleTicketOrderChange } from './OrderTickets'
import { TicketViewContainer } from './TicketViewContainer'
import { ticketsSortOptions, displayTicketOptions } from '../../utils/selectOptions'
import { selectStyles, customStyles } from '../../utils/Select-Styles'
import { UserContext } from '../../context/UserProvider'

export const DisplayedTicket = () => {
  const { user, loading } = useContext(UserContext)
  const [tickets, setTickets] = useState<TicketCardType[]>([])
  const [displayOption, setDisplayOption] = useState<{ label: string; value: string }>(displayTicketOptions[1]) // default to 'All'
  const [displayOrder, setDisplayOrder] = useState<string>('asc')
  const [orderValue, setOrderValue] = useState<string>('createdAt')
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)

  // Handle filter by ticket status
  const handleOptionChange = (option: SingleValue<{ label: string; value: string }>) => {
    if (option) {
      setDisplayOption(option)
    }
  }

  // Handle sorting order and update tickets array
  const handleOrderTicketsChange = (newTickets: TicketCardType[]) => {
    setTickets(newTickets)
  }

  if (loading || !user) {
    return <div>Loading...</div>
  }

  // Map displayOption.value to status filter param for the API
  // 'new' could be mapped to status 'new' or however your backend interprets it
  const statusFilter = (() => {
    switch (displayOption.value) {
      case 'all':
        return undefined
      case 'new':
        return 'new' // or your backend status for new tickets
      case 'in-progress':
        return 'in-progress'
      case 'completed':
        return 'completed'
      default:
        return undefined
    }
  })()

  return (
    <div className="w-full block">
      <div className="flex mb-4">
        <TicketSearch
          tickets={tickets}
          displayTickets={(filteredTickets: TicketCardType[], query: string) => {
            setTickets(filteredTickets)
            setSearchQuery(query || undefined)
          }}
        />

        <Select
          options={displayTicketOptions}
          styles={{ ...selectStyles('#cbd5e1', '#000'), ...customStyles }}
          className="w-1/5 z-10 relative outline-none focus:outline-none mr-4"
          value={displayOption}
          onChange={(e) => handleOptionChange(e)}
        />

        <OrderTickets
          options={ticketsSortOptions}
          items={tickets}
          setItems={handleOrderTicketsChange}
          setOrderValue={(value: string) => setOrderValue(value)}
          orderStyle="w-1/5 z-10 relative outline-none focus:outline-none"
          styles={{ ...selectStyles('#cbd5e1', '#000'), ...customStyles }}
          order={displayOrder}
        />

        <button
          onClick={() => {
            const newOrder = displayOrder === 'asc' ? 'desc' : 'asc'
            setDisplayOrder(newOrder)
            handleOrderTicketsChange(handleTicketOrderChange(orderValue, tickets, newOrder))
          }}
          className="p-2 border border-gray-800 rounded-md justify-center text-center items-center mx-2 bg-white"
          aria-label="Toggle order"
        >
          {displayOrder === 'asc' ? <TbArrowsUpDown /> : <TbArrowsDownUp />}
        </button>
      </div>

      <TicketViewContainer
        limit={10}
        order={orderValue}
        orderDirection={displayOrder}
        searchQuery={searchQuery}
        status={statusFilter}
        priority={undefined} // You can add priority filter here if needed
      />
    </div>
  )
}
