import React, {useEffect, useState, useContext} from 'react'
import {getAllUsersForChats} from "../../api/messages/users"
import {User} from "../../utils/interfaces/User"
import { getAuth } from 'firebase/auth'
import { UserContext } from '../../context/UserProvider'
import { MessageNavbar } from './MessageNavbar'
import DefaultImage from "../../Images/ProfileImage.jpg"

interface MessageSidebarProps {
    handleSetChat: (value: User | null) => void;
}

export const MessageSidebar: React.FC<MessageSidebarProps> = ({handleSetChat}) => {
    const auth = getAuth();
    const {users} = useContext(UserContext);
    const [currentUser, setCurrentUser] = useState<string>('');
    const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
    const [dispUsers, setDispUsers] = useState<User[]>([]);

    useEffect(() => {
        const filteredUsers = users.filter((user) => user.id !== auth.currentUser?.uid);
        setDisplayedUsers(filteredUsers);
        setDispUsers(filteredUsers);
    }, [users]);

    useEffect(() => {
        if (auth.currentUser?.displayName) {
            setCurrentUser(auth.currentUser.displayName)
        }
    }, [auth]);


    const handleSearchUser = (value: string) => {
        if (value.length === 0) {
            setDisplayedUsers(dispUsers);
        }

        value = value.toLowerCase();
        const filter = dispUsers.filter((user) => {
            return user.displayName.includes(value) || user.email.includes(value); 
        });

        setDisplayedUsers(filter);
    }

    return (
        <div className="fixed w-1/6 top-16 right-0 bg-gray-100 h-full z-20">
            <MessageNavbar
                handleSearchUser={handleSearchUser} 
                user={currentUser} 
            />

            {displayedUsers.map((user, id) => (
                <div
                    key={id} 
                    className='flex hover:bg-gray-300 cursor-pointer py-4 px-2'
                    onClick={() => handleSetChat(user)}
                >
                    <div className='mr-4 pt-2'>
                        <img 
                            src={user.photoUrl !== undefined ? user.photoUrl : DefaultImage} 
                            alt="user profile"
                            className="rounded-full w-72 lg:w-10" 
                        />
                    </div>

                    <div className='block text-md font-semibold'>
                        <h6 className='mb-1'>{user.email}</h6>
                        <span className={
                            `${user.status === "online" ? 
                                'text-green-500 border-green-500' : 
                                'text-red-500 border-red-500'
                            } border-2 rounded-md px-1`
                        }>
                            {user.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}