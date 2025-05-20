import React, {useContext, useEffect, useState} from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Outlet } from 'react-router-dom'
import DefaultProfileImage from '../Images/default-user-photo.svg'
import { UserContext } from '../context/UserProvider'

export const LayoutPages = () => {
  const {user} = useContext(UserContext);
  const [username, setUsername] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>(DefaultProfileImage)

  useEffect(() => {
    if (user) {
      setProfileImage(user.photoUrl);
      setUsername(user.displayName)
    }
  }, [user]);

  return (
      <div className='block bg-gray-100'>
        <Navbar username={username} profileImage={profileImage}/>
        <div className='flex pt-16'>
          <div className='lg:mr-52'>
          <Sidebar />
          </div>
          <div className='w-full h-screen'>
            <Outlet />
          </div>
        </div>
      </div>
  )
}
