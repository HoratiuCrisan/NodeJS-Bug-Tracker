import React from 'react'
import {
    FaEnvelope,
    FaUser,
    FaLock,
} from "react-icons/fa";
import { ErrorMessageCard } from '../ErrorMessageCard'
import { RegisterFormData, UserFormErrors } from '../../utils/interfaces/User'

interface RegistrationFormProps  {
    formData: RegisterFormData
    errors: UserFormErrors
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: React.FormEvent) => void
    registrationError: null | string
}

/**
 * Responsible for receiving the user registration data
 * @param formData - stores the user registration data
 * @param errors - if needed sends an error message to the ErrorMessageCard component
 * @param onInputChange - changes the input value
 * @param onSubmit - passing the user registration information to the RegistrationContainer 
 */

 const RegisterForm : React.FC<RegistrationFormProps> = ({formData , errors, onInputChange, onSubmit, registrationError}) => {
    return (
        <form onSubmit={onSubmit}>
            <label 
                htmlFor="username"
                className='text-lg font-medium font-mono'
            >
                Username
                <div className='flex mb-1'>
                    <FaUser className='text-xl absolute mt-4 ml-2 text-gray-400'/>
                        <input 
                            type="text"
                            name="username"
                            id="username"
                            required
                            autoComplete="off"
                            value={formData.username}
                            onChange={onInputChange} 
                            className={`block font-semibold text-sm w-full border-2 rounded-md my-2 py-2 pl-10 ${(errors.username.length > 0 && formData.username.length > 0) ? 'border-red-500 ' : 'border-gray-300'}`}
                        />
                </div>
               
            </label>

            <label 
                htmlFor="email"
                className='text-lg font-medium font-mono'    
            >
                Email
                <div className='flex mb-1'>
                    <FaEnvelope className='text-xl absolute mt-4 ml-2 text-gray-400'/>
                    <input 
                        type="email"
                        name="email"
                        id="email"
                        required
                        autoComplete="off"
                        value={formData.email}
                        onChange={onInputChange} 
                        className={`block font-semibold text-sm w-full border-2 rounded-md my-2 py-2 pl-10 border-gray-300`} 
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
                        className={`block font-semibold text-sm w-full border-2 rounded-md my-2 py-2 pl-10 ${(errors.password.length > 0 && formData.password.length > 0) ? 'border-red-500 ' : 'border-gray-300'}`}
                    />
                </div>
                {
                    (errors.username.length > 0 && formData.username.length > 0) ?
                        <ErrorMessageCard text={errors.username} />
                    : (errors.password.length > 0 && formData.password.length > 0) ?
                        <ErrorMessageCard text={errors.password} />  
                    : registrationError ?
                        <ErrorMessageCard text={registrationError} />
                    : null 
                }
            </label>
            
            <button className='w-full bg-green-700 hover:bg-green-800 text-white text-lg font-semibold rounded-md py-2 my-4'>
                Register
            </button>
        </form>
    )
}

export default RegisterForm