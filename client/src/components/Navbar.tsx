import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';
import { BsStack } from 'react-icons/bs';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { NotificationDialog } from './NotificationComponents/NotificationDialog';
import { UserContext } from '../context/UserProvider';
import { Notification } from '../utils/types/Notification';
import { NavbarProps } from '../utils/types/Navbar';

export const Navbar: React.FC<NavbarProps> = ({ username, profileImage }) => {
    const { notifications } = useContext(UserContext);
    const navigate = useNavigate();
    const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState<boolean>(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [unReadNotifications, setUnReadNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        setUnReadNotifications(notifications.filter(notification => !notification.read));
    }, [notifications]);

    const handleProfileMenuToggle = (value: boolean) => {
        setIsProfileMenuOpen(value);
    };

    return (
        <nav className="fixed w-full bg-gray-100 shadow-md py-3 top-0 z-50">
            <div className="flex justify-between">
                <div className="flex">
                    <span className="text-xl text-gray-800 mx-2 mt-2 lg:hidden cursor-pointer">
                        <BsStack />
                    </span>
                    <h1
                        onClick={() => navigate("/")}
                        className="mx-2 text-green-600 text-xl font-bold cursor-pointer"
                    >
                        Bug<span className="text-gray-800">Tracker</span>
                    </h1>
                </div>
                <div className="flex justify-end text-end items-end">
                    <div
                        onClick={() => setIsNotificationDialogOpen(!isNotificationDialogOpen)}
                        className={`text-3xl cursor-pointer px-3 py-1 relative`}
                    >
                        <IoMdNotificationsOutline className="" />
                        {unReadNotifications.length > 0 && (
                            <span className="absolute top-0 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
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
                            src={profileImage}
                            width={'40vh'}
                            className="rounded-full p-1 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {isProfileMenuOpen && <ProfileMenu isOpen={isProfileMenuOpen} onOpen={handleProfileMenuToggle} />}

            {isNotificationDialogOpen && <NotificationDialog />}
        </nav>
    );
};
