import React, {useEffect, useState} from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Outlet } from 'react-router-dom'
import DefaultProfileImage from '../Images/default-user-photo.svg'
import { getAuth } from 'firebase/auth'
import { UserProvider } from '../context/UserProvider'

export const LayoutPages = () => {
  const auth = getAuth()
  const [username, setUsername] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<string>(DefaultProfileImage)

  useEffect(() => {
    if (auth.currentUser && auth.currentUser.photoURL) {
      setUsername(auth.currentUser.displayName);
      setProfileImage(auth.currentUser.photoURL);
    }
  }, [auth.currentUser])

  return (
    <UserProvider>
      <div className='block'>
        <Navbar username={username} profileImage={profileImage}/>
        <div className='flex pt-16'>
          <div className='lg:mr-52'>
          <Sidebar />
          </div>
          <div className='w-full '>
            <Outlet />
          </div>
        </div>
      </div>
    </UserProvider>
  )
}
