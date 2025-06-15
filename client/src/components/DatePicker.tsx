import React from 'react'
import {DatePickerType} from '../types/Date'
import dayjs from 'dayjs';

const currentDate = new Date().toISOString().split('T')[0];

export const DatePicker: React.FC<DatePickerType> = ({style, onInputChange, value}) => {
    const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timestamp = new Date(e.target.value).getTime();
        onInputChange(timestamp, "deadline");
    }  

    return (
        <input 
            type="date" 
            value={new Date(value).toISOString().split('T')[0]}
            min={currentDate}
            onChange={handleDeadlineChange}
            className={style}
        />
    )
}
