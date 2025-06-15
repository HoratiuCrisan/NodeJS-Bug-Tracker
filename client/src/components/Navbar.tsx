import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';
import { BsStack } from 'react-icons/bs';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { NotificationDialog } from './NotificationComponents/NotificationDialog';
import { UserContext } from '../context/UserProvider';
import { NavbarProps } from '../types/Navbar';
import defaultPhoto from "../Images/default-user-photo.svg";

export const Navbar: React.FC<NavbarProps> = ({ username, profileImage, onSidebar, sidebarValue }) => {
    const {unreadNotificationCount, user, unreadNotifications} = useContext(UserContext);
    const navigate = useNavigate();
    const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState<boolean>(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    
    useEffect(() => {
    }, [user, unreadNotifications]);

    const handleProfileMenuToggle = (value: boolean) => {
        setIsProfileMenuOpen(value);
    };

    const handleNotificationsDialog = (value: boolean) => {
        setIsNotificationDialogOpen(value);
    }

    return (
        <nav className="fixed w-full bg-white shadow-md py-3 top-0 z-50">
            <div className="flex justify-between">
                <div className="flex">
                    <button 
                        onClick={() => onSidebar(!sidebarValue)}
                        className="text-xl text-gray-800 mx-2 mt-2 lg:hidden cursor-pointer"
                    >
                        <BsStack />
                    </button>
                    <h1
                        onClick={() => navigate("/")}
                        className="mx-2 mt-2 lg:mt-0 text-green-600 text-xl font-bold cursor-pointer"
                    >
                        Bug<span className="text-gray-800">Tracker</span>
                    </h1>
                </div>
                <div className="flex justify-end text-end items-end">
                   <div
                        onClick={() => handleNotificationsDialog(!isNotificationDialogOpen)}
                        className={`text-3xl cursor-pointer px-3 py-1 mx-2 relative`}
                    >
                        <IoMdNotificationsOutline className=''/>
                        {unreadNotificationCount > 0 && (
                            <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center text-center pr-0.5">
                                {unreadNotificationCount <= 99 ? unreadNotificationCount : `99+`}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => navigate("/create-ticket")}
                        className="bg-green-700 hover:bg-green-800 text-white font-sans rounded-md mx-2 p-2"
                    >
                        new ticket
                    </button>
                    <div className="flex justify-between mx-4">
                        <img
                            onClick={() => handleProfileMenuToggle(!isProfileMenuOpen)}
                            src={profileImage ?? defaultPhoto}
                            onError={(e) => e.currentTarget.src=`${defaultPhoto}`}
                            width={'40vh'}
                            className="rounded-full p-1 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {isProfileMenuOpen && <ProfileMenu isOpen={isProfileMenuOpen} onOpen={handleProfileMenuToggle} />}

            {isNotificationDialogOpen && unreadNotificationCount > 0 && <NotificationDialog notifications={unreadNotifications} onClose={handleNotificationsDialog}/>} 
        </nav>
    );
};
