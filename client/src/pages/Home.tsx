import React from 'react'
import { useAuth } from '../config/AuthContext'

export const Home = () => {
    const {currentUser} = useAuth()
    return (
      <>
        <h1 className='text-lg font-semibold'>
          {currentUser?.displayName}'s tickets
        </h1>
      </>
    )
}
