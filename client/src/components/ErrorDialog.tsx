import React from 'react'
import { IoCloseOutline } from 'react-icons/io5'

interface ErrorDialogProps {
    text: string
    onClose: () => void
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({text, onClose}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-gray-50 p-4 rounded-lg shadow-lg w-2/6">
                <div className='block justify-center mx-auto w-full bg-gray-50'>
                    <div className='flex w-full justify-end items-end text-end'>
                        <IoCloseOutline 
                            onClick={onClose}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            size={24}
                        />
                    </div>

                    <h1 className='flex justify-center text-center mx-auto text-md lg:text-lg text-red-500 font-bold my-4'>{text}</h1>

                    <div className='flex justify-center items-center mx-auto'>
                        <button
                            className='rounded-md text-white bg-emerald-500 hover:bg-emerald-700 py-2 px-6 my-6'
                            onClick={onClose}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
