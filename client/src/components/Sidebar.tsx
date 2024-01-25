import React from 'react'
import { FaRegEnvelope } from "react-icons/fa6"
import { FaUsers } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'

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
    }
]

export const Sidebar = () => {
    const navigate = useNavigate()
    return (
        <aside className='fixed hidden lg:block lg:w-1/6 2xl:w-56 h-screen bg-gray-100'>
            {sidebarElements.map((elem) => (
                <div 
                    key={elem.id}
                    onClick={() => navigate(elem.href)}
                    className='flex text-lg font-semibold py-2 my-2 hover:bg-gray-200 hover:rounded-md cursor-pointer'
                >
                    <h1 className='text-xl mt-1 mx-4'>{elem.icon}</h1>
                    <h1>{elem.title}</h1>
                </div>
            ))}
        </aside>
    )
}
