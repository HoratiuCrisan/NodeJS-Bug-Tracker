import React, {useEffect, useState} from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Outlet } from 'react-router-dom'
import DefaultProfileImage from '../Images/default-user-photo.svg'
import { useAuth } from '../config/AuthContext'

export const LayoutPages = () => {
  const {currentUser} = useAuth()
  const [username, setUsername] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<string>(DefaultProfileImage)

  useEffect(() => {
    if (currentUser?.displayName) {
      setUsername(currentUser.displayName)
    }

    if (currentUser?.photoURL) {
      setProfileImage(currentUser.photoURL)
    }
  }, [])

  return (
    <div className='block'>
      <Navbar username={username} profileImage={profileImage}/>
      <div className='flex pt-16'>
        <Sidebar />
        <div className='pl-4 lg:pl-72 pt-4 w-full '>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
