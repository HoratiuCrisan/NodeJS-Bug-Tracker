import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileMenu } from './ProfileMenu'


interface NavbarProps {
    username: string | null
    profileImage: string
}

export const Navbar: React.FC<NavbarProps> = ({username, profileImage}) => {
    const navigate = useNavigate()
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

    const handleProfileMenuToggle = (value: boolean) => {
        setIsProfileMenuOpen(value) 
    }


    return (
        <nav
            className="fixed w-full py-3 bg-gray-100 shadow-md"
        >
            <div className='flex justify-between'>
                <h1 
                    onClick={() => navigate("/")}
                    className='mx-2 text-green-600 text-xl font-bold cursor-pointer'
                >
                    Bug<span className='text-gray-800'>Tracker</span>
                </h1>
                <div className='flex justify-end text-end items-end'>
                    <button className='bg-green-700 hover:bg-green-800 p-2 text-white font-sans rounded-md mx-2'>
                        new ticket
                    </button>
                    <div className='flex justify-between mx-4'>
                        <img 
                            onClick={() => handleProfileMenuToggle(!isProfileMenuOpen)}
                            src={profileImage} 
                            alt="profile icon" 
                            width={'40vh'}
                            className='rounded-full p-1 cursor-pointer'
                        />
                    </div>
                </div>
            </div>

            {
                isProfileMenuOpen &&
                <ProfileMenu isOpen={isProfileMenuOpen} onOpen={handleProfileMenuToggle} />
            }
        </nav>
    )
}
