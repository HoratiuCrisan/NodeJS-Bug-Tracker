import React, { useState } from 'react'
import Select from 'react-select'
import { DatePicker } from '../DatePicker'
import { ErrorMessageCard } from '../../authentication/ErrorMessageCard'
import { TicketFormType} from '../../types/Ticket'
import { selectStyles, customStyles } from '../../utils/Select-Styles'
import { TextEditor } from '../TextEditor'

export const TicketForm: React.FC<TicketFormType> = ({formData, formError, onSubmit, onInputChange, priority, type, value}) => {
    return (
        <form 
            onSubmit={onSubmit} 
            className='my-2'
        >
            <div className='mx-6'>
                <h1 className='text-center text-xl font-bold my-4'>
                Create Ticket 
                </h1>
                <label 
                    htmlFor="ticket-title"
                    className="text-lg font-mono font-semibold"
                >
                    Title
                    <input 
                        type="text"
                        name="ticket-title"
                        id="ticket-title"
                        autoComplete={"off"}
                        required
                        value={formData.title}
                        onChange={(e) => onInputChange(e.target.value, 'title')}
                        className="block border-gray-300 font-medium text-sm w-full border-2 rounded-md my-4 py-2 pl-2"
                    />
                </label>

                <label 
                    htmlFor="ticket-description"
                    className="text-lg font-mono font-semibold"
                >
                    Description
                    <textarea 
                        rows={5}
                        cols={50}
                        name="ticket-description"
                        id="ticket-description"
                        autoComplete={"off"}
                        required
                        value={formData.description}
                        onChange={(e) => onInputChange(e.target.value, 'description')}
                        className="block border-gray-300 font-medium text-sm w-full border-2 rounded-md my-4 py-2 pl-2"
                    />
                </label>

                <label 
                    htmlFor="ticket-priority"
                    className="text-lg font-mono font-semibold"
                >
                    Priority
                    <div className='block my-2'>
                        <Select 
                            name='ticket-priority'
                            id="ticket-type"
                            options={priority}
                            styles={{...selectStyles("#34d399", "#000"), ...customStyles}}
                            placeholder={"Select priority..."}
                            required
                            value={formData.priority}
                            onChange={(e) => onInputChange(e?.label, 'priority')}
                            className='block font-semibold text-sm text-black w-full rounded-md my-4'
                        />
                    </div>
                </label>

                <label 
                    htmlFor="ticket-type"
                    className="text-lg font-mono font-semibold"
                >
                    Type
                    <div className='block my-2'>
                        <Select 
                            name="ticket-type"
                            id="ticket-type"
                            options={type}
                            styles={{...selectStyles("#34d399", "#000"), ...customStyles}}
                            placeholder={"Select type..."}
                            value={formData.type}
                            onChange={(e) => onInputChange(e?.label, 'type')}
                            className='block font-semibold text-sm text-black w-full rounded-md my-4'
                        />
                    </div>
                </label>

                <label 
                    htmlFor="ticket-deadline"
                    className="text-lg font-mono font-semibold"
                >
                    Deadline
                    <DatePicker 
                        value={value}
                        onInputChange={onInputChange}
                        style={"block w-full text-sm md:w-1/3 xl:w-2/5 2xl:w-1/6 border-2 border-gray-300 focus:border-gray-800 rounded-md p-2 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                    />
                </label>

                {
                    formError && 
                    <ErrorMessageCard text={formError}/>
                }

                <button
                    type={"submit"}
                    className='block w-full  bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md py-2 mt-4'
                >
                    Submit
                </button>
            </div>
        </form>
  )
}
