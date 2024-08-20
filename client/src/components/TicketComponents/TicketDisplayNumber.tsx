import React from 'react'
import Select from 'react-select'
import { Ticket, TicketViewNumberProps } from '../../utils/interfaces/Ticket'


export const TicketDisplayNumber: React.FC<TicketViewNumberProps> = ({items, options, styles, viewStyle, setItemsNumbers}) => {
    const handleViewNumberChange = (value: number | undefined) => {
        if (value === undefined) 
            return items

        console.log(items.slice(0, 5))
        setItemsNumbers(value)
    }

    return (
    <div className={`${viewStyle}`}>
        <Select 
            options={options}
            defaultValue={options[0]}
            styles={styles}
            onChange={(e) => handleViewNumberChange(e?.value)}
        />
    </div>
  )
}
