import React from 'react'
import {useAuth} from '../config/AuthContext'
import { useNavigate } from 'react-router-dom'

interface ProfileMenuProps {
    isOpen: boolean
    onOpen: (value: boolean) => void
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({isOpen, onOpen}) => {
  const navigate = useNavigate()
  const {currentUser, signOutUser} = useAuth()

  const handleSignOut = async () => {
    await signOutUser()
    onOpen(false)
    navigate("/login")
  }


  return (
    <div className='fixed block w-1/5 bg-white text-center shadow-md rounded-md p-2 mt-2 right-4'>
      <div>
      <h1>{currentUser?.displayName}</h1>
      <h1>{currentUser?.email}</h1>
      </div>

      <div
        onClick={handleSignOut} 
        className='w-full cursor-pointer'
      >
        Sign out
      </div>
    </div>
  )
}
