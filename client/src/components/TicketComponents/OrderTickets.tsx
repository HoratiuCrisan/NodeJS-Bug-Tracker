import React, {useState} from 'react'
import {TicketCard, TicketsOrderProps} from '../../utils/types/Ticket'
import Select from 'react-select'

export const handleTicketOrderChange = (option: string | undefined, items: TicketCard[], order: string) => {
    console.log(option, order)
    if (option === undefined || option === null) {
        return items; // TODO: Implement an error card case 
    }

    if (option !== 'title' && option !== 'deadline' && option !== 'priority') {
        return items;
    }

    const ticketsSorted = [...items].sort((a, b) => {
        const aValue = a[option];
        const bValue = b[option];

        if (order === 'asc') {
            if (aValue < bValue) return -1;
            if (aValue > bValue) return 1;
        } else {
            if (aValue > bValue) return -1;
            if (aValue < bValue) return 1;
        }
        
        return 0;
    });

    return ticketsSorted;
}



export const OrderTickets: React.FC<TicketsOrderProps> = ({options, items, setItems, setOrderValue, orderStyle, styles, order}) => {
    const handleValueOrderChange = (value: string | undefined) => {
        if (value === undefined)
            return;
        setOrderValue(value)
    }
    return (
        <div className={`${orderStyle}`}>
            <Select 
                options={options}
                //defaultValue={options[0]}
                onChange={(e) => {
                    setItems(handleTicketOrderChange(e?.value, items, order));
                    handleValueOrderChange(e?.value)
                }}
                placeholder={'Order...'}
                styles={styles}
            />
        </div>
    )
}
