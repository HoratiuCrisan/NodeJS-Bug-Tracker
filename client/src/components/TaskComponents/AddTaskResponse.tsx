import React, {useState} from 'react'
import { Task } from '../../utils/types/Project'
import { TextEditor } from '../TextEditor'

interface Props {
    onClose: () => void
    onSubmit: () => Promise<void>
    value: string
    onChange: (e: string) => void
    data: Task
}

export const AddTaskResponse: React.FC<Props> = ({onClose, data, value, onSubmit, onChange}) => {
    
    return (
        <div className='bg-white'>
            <TextEditor
                value={value}
                onChange={onChange}
                readonly={false}
            />

            <div className='flex justify-end items-end my-4'>
                <button
                    onClick={onClose}
                    className='bg-red-500 hover:bg-red-600 text-white hover:text-gray-100 rounded-md p-2 mx-1 mb-2'
                >
                    Close
                </button>

                <button
                    onClick={() => {onSubmit(); onClose()}}
                    className='bg-green-500 hover:bg-green-600 text-white hover:text-gray-100 rounded-md p-2 mx-1 mb-2'
                >
                    Submit
                </button>
            </div>
        </div>
    )
}
