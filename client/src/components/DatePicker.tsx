import React from 'react'
import {DatePickerType} from '../types/Date'

const currentDate = new Date().toISOString().slice(0, 16);

export const DatePicker: React.FC<DatePickerType> = ({style, onInputChange}) => {
    const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timestamp = new Date(e.target.value).getTime();
        onInputChange(timestamp, "deadline");
    }  

    return (
        <input 
            type="datetime-local" 
            min={currentDate}
            onChange={handleDeadlineChange}
            className={style}
        />
    )
}
