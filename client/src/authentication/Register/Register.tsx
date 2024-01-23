import React from 'react'
import RegisterImage from '../../Images/register-image-2.svg'
import { RegistrationContainer } from './RegistrationContainer'
import { FcGoogle } from "react-icons/fc"
import { GoogleAuth } from '../GoogleAuth'
import { useNavigate } from 'react-router-dom'

/**
 * Responsible for rendering register page with its components
 * 
 */

export const Register  = () => {
    const navigate = useNavigate()
    return (
        <div className='bg-gray-100 w-full flex items-center justify-center h-screen'>
            <div className='flex w-2/3 bg-gray-50  rounded-lg shadow-lg'>
                <img 
                    src={RegisterImage} 
                    alt="Register Page Image"
                    className='hidden xl:block w-3/6'
                />
                <div className='w-full xl:w-3/4 rounded-md'>
                    <h1 className='text-lg text-gray-700 font-bold text-end m-4'>
                        Bug
                        <span className='text-green-600'>
                            Tracker
                        </span>
                    </h1>

                    <div className='mx-20 xl:mt-28'>
                        <h1 className='text-center font-bold text-2xl text-green-800 my-4'>Create Account</h1>
                            <RegistrationContainer />
                        <h1 className='font-semibold'>
                            Already a user?
                            <span
                                onClick={() => navigate("/login")}
                                className='ml-1 text-blue-600 cursor-pointer'>
                                Log in
                            </span>
                        </h1>

                        {/*  Google Registration */}
                        <div className='flex'>
                            <hr className='bg-gray-300 w-1/2 mt-4'/>
                            <h1 className='text-xl font-semibold text-gray-600 mx-2'>or</h1>
                            <hr className='bg-gray-300 w-1/2 mt-4'/>
                        </div>

                        <button className='flex items-center justify-center w-full bg-white font-semibold border border-1 rounded-md border-gray-300 hover:bg-gray-200 hover:border-gray-400 mt-4 mb-8 py-2 '>
                            <GoogleAuth 
                                text={`Continue with Google`} 
                                icon={
                                    <FcGoogle className='mr-2 text-2xl'/>
                                }
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
  )
}
