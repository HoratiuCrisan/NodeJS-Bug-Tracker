import React, {useState, useEffect} from 'react'
import { User } from '../../utils/types/User';
import DefaultImage from "../../Images/ProfileImage.jpg"

interface ChatsNavbarProps {
  chat: User | null;
}

export const ChatsNavbar: React.FC<ChatsNavbarProps> = ({chat}) => {
  const [user, setUser] = useState<User>();


  useEffect(() => {
    if (chat) {
      setUser(chat);
    }
  }, [chat])

  if (!user) {
    return <div>Loading...</div>
  }
  
  return (
        <div className='flex w-full bg-emerald-500 text-gray-200 py-2 pl-4'>
            <img
              className='w-12 rounded-full mr-4' 
              src={user.photoUrl ? user.photoUrl : DefaultImage} 
              alt="user profile" 
            />
            <div className='block'>
              <span className='block'>{user?.displayName}</span>
              {user.status === "online" && <span>{user?.status}</span>}
            </div>
        </div>
  )
}
