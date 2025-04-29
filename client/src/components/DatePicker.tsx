import React from 'react'
import {DatePickerProps} from '../utils/types/Date'

const currentDate = new Date().toISOString().split('T')[0]

export const DatePicker: React.FC<DatePickerProps> = ({style, deadline, onInputChange}) => {
    return (
        <input 
            type="date" 
            min={currentDate}
            value={deadline}
            onChange={(e) => onInputChange(e.target.value, 'deadline')}
            className={style}
        />
    )
}
