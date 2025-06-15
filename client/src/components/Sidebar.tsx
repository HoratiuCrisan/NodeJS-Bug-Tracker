import React, { useContext, useEffect } from 'react'
import { FaRegEnvelope } from "react-icons/fa6"
import { FaUsers } from "react-icons/fa"
import { IoChatbox } from "react-icons/io5";
import { IoMdNotifications } from "react-icons/io";
import { FaUsersRectangle } from "react-icons/fa6";
import { VscDebugConsole } from "react-icons/vsc";
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserProvider';
import { useCan } from '../hooks/useCan';

const sidebarElements = [
    {
        id: 0,
        title: 'My Tickets',
        href: "/",
        icon: <FaRegEnvelope />
    },
    {
        id: 1,
        title: 'My Projects',
        href: "/projects",
        icon: <FaUsers />
    },
    {
        id: 2,
        title: 'My Messages',
        href: "/messages",
        icon: <IoChatbox />
    },
    {
        id: 3,
        title: 'My Notifications',
        href: "/notifications",
        icon: <IoMdNotifications />
    },
    {
        id: 4,
        title: 'Users',
        href: "/users",
        icon: <FaUsersRectangle />
    },
    {
        id: 5,
        title: "Admin",
        href: "/admin",
        icon: <FaUsersRectangle />
    },
    {
        id: 6,
        title: "Console",
        href: "/console",
        icon: <VscDebugConsole />
    }
];

type SidebarType = {
    onSidebar: boolean
}

export const Sidebar: React.FC<SidebarType> = ({onSidebar}) => {
    const {user, unreadNotificationCount, unreadMessageCount} = useContext(UserContext);
    const canViewConsole = useCan("viewConsole");
    const canViewAdmin = useCan("viewAdmin");
    const canViewUsers = useCan("viewUsers");
    const navigate = useNavigate();

    useEffect(() => {}, [unreadMessageCount, unreadNotificationCount]);

    const filteredSidebarElements = sidebarElements.filter((elem) => {
        if (elem.href === "/console") return canViewConsole;
        if (elem.href === "/admin") return canViewAdmin;
        if (elem.href === "/users") return canViewUsers;
        return true;
    })

    return (
        <aside className={`fixed ${onSidebar ? `block z-50 w-2/4`: `hidden`} lg:block lg:w-1/6 2xl:w-56 h-screen bg-white z-20`}>
            {filteredSidebarElements.map((elem) => (
                <div 
                    key={elem.id}
                    onClick={() => navigate(elem.href)}
                    className='flex items-center text-lg font-semibold py-2 my-2 hover:bg-gray-200 hover:rounded-md cursor-pointer relative px-4'
                >
                    <div className="relative">
                        <h1 className='text-xl'>{elem.icon}</h1>
                        {elem.href === "/notifications" && unreadNotificationCount > 0 &&
                            <span 
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                            >
                                {unreadNotificationCount}
                            </span>
                        }
                    </div>
                    <h1 className='ml-3'>{elem.title}</h1>
                </div>
            ))}
        </aside>
    )
}
