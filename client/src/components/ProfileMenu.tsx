import React, {useEffect} from 'react'
import {useAuth} from '../config/AuthContext'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { ProfileMenuProps } from '../utils/types/Navbar'

export const ProfileMenu: React.FC<ProfileMenuProps> = ({isOpen, onOpen}) => {
  const navigate = useNavigate()
  const { signOutUser} = useAuth()
  const auth = getAuth();

  useEffect(() => {

  }, [auth.currentUser]);

  const handleSignOut = async () => {
    await signOutUser()
    onOpen(false)
    navigate("/login")
  }

  if (!auth.currentUser) {
    return <></>
  }


  return (
    <div className='fixed block w-1/5 bg-white text-center shadow-md rounded-md p-2 mt-2 right-4'>
      <div>
      <h1>{auth.currentUser.displayName}</h1>
      <h1>{auth.currentUser.email}</h1>
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
