import React from 'react'
import { useNavigate} from 'react-router-dom'
import LoginImage from '../../Images/login-image.svg'
import { LoginContainer } from './LoginContainer'
import { GoogleAuth } from '../GoogleAuth'
import { FcGoogle } from "react-icons/fc"


/**
 * Responsible for rendering the login page and its components
 */


export const Login = () => {
    const navigate = useNavigate()
    return (
        <div className='bg-gray-100 w-full flex items-center justify-center h-screen'>
            <div className='flex w-2/3 bg-gray-50  rounded-lg shadow-lg'>
                <img 
                    src={LoginImage} 
                    alt="Login Image" 
                    className='hidden xl:block w-3/6'
                />

                <div className='w-full xl:w-3/4 rounded-md '>
                    <div className='flex-1'>
                        <h1 className='text-lg text-gray-700 font-bold text-end m-4'>
                            Bug
                            <span className='text-green-600'>
                                Tracker
                            </span>
                        </h1>
                    </div>

                    <div className='mx-20 xl:my-32'>
                        <h1 className='text-center font-bold text-2xl text-green-800 my-4'>Log In</h1>
                            <LoginContainer />
                        <h1 className='font-semibold'>
                            New here? 
                            <span 
                                onClick={() => navigate("/register")} 
                                className='text-blue-600 ml-1 cursor-pointer'
                            >
                                Sign up
                            </span>
                        </h1>

                        {/*  Google Registration */}
                        <div className='flex'>
                            <hr className='bg-gray-300 w-1/2 mt-4'/>
                            <h1 className='text-xl font-semibold text-gray-600 mx-2'>or</h1>
                            <hr className='bg-gray-300 w-1/2 mt-4'/>
                        </div>

                        <button 
                            className='flex w-full justify-center items-center bg-white font-semibold border border-1 rounded-md border-gray-300 hover:bg-gray-200 hover:border-gray-400 mt-4 mb-8 py-2 '>
                            <GoogleAuth 
                                text={'Continue with Google'} 
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
