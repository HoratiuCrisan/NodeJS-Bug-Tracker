import React from 'react'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import { ErrorMessageCard } from '../ErrorMessageCard'
import {LoginFormProps} from '../../utils/types/User'


/**
 * Responsible for receiving the input values from the user
 * 
 * - Passes the input data to the LoginContainter
 */

export const LoginForm: React.FC<LoginFormProps> = ({formData, formError, onInputChange, onSubmit}) => {
  return (
    <form onSubmit={onSubmit}>
        <label 
            htmlFor="email"
            className='text-lg font-medium font-mono'
        >
            Email
            <div className='block mb-4'>
                <FaEnvelope className='text-xl absolute mt-2 ml-2 text-gray-400'/>
                <input 
                    type="text" 
                    name="email"
                    id="email"
                    autoComplete="off"
                    required
                    value={formData.email}
                    onChange={onInputChange} 
                    className='block border-gray-300 font-semibold text-sm w-full border-2 rounded-md my-2 py-2 pl-10'
                />
            </div>
       </label>

       <label 
            htmlFor="password"
            className='text-lg font-medium font-mono'
        >
            Password
            <div className='flex'>
                <FaLock className='text-xl absolute mt-4 ml-2 text-gray-400'/>
                <input 
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={onInputChange} 
                    className={`block font-semibold text-sm w-full border-2 border-gray-300 rounded-md my-2 py-2 pl-10 `}
                />
            </div>
        </label>

        {
            formError && <ErrorMessageCard text={formError}/>
        }

        <button 
            type={"submit"}
            className='w-full bg-green-700 hover:bg-green-800 text-white text-lg font-semibold rounded-md py-2 my-4'
        >
                Log In
        </button>
    </form>
  )
}


