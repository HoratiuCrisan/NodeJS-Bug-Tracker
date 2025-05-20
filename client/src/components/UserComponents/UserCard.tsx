import React, { ReactNode, useState} from "react";
import { User } from "../../types/User";
import {IoIosMore} from "react-icons/io";
import { UpdateUserRole } from "./UpdateUserRole";
import { useCan } from "../../hooks/useCan";

type UserCardType = {
    user: User;
}

export const UserCard: React.FC<UserCardType> = ({user}) => {
    const [updateRoleDialog, setUpdateRoleDialog] = useState<boolean>(false);
    const can = useCan("updateUserRole");

    const updateRoleDialogOnChange = (value: boolean) => {
        setUpdateRoleDialog(value);
    }

    const getDateTime = (date: string): string => {
        return date.slice(0, 21)
    }

    const userStatus = (status: "online" | "offline"): ReactNode => {
        if (status === "online") {
            return <span className="flex justify-start bg-green-600 text-white font-semibold rounded-lg px-2 py-1">{status}</span>
        }

        return <span className="flex justify-start bg-red-600 text-white font-semibold rounded-lg px-2 py-1">{status}</span>
    }

    return (
        <div className="w-full bg-white shadow-lg rounded-lg p-4 max-h-72">
            <div className="flex justify-between">
                {userStatus(user.status)}
                <>{
                    can && 
                    (<button 
                        className="text-lg font-bold"
                        onClick={() => updateRoleDialogOnChange(!updateRoleDialog)}
                    >
                        <IoIosMore />
                     </button>)
                }</>
                
            </div>
            <img src={user.photoUrl} alt="profile-picture" className="flex justify-center mx-auto w-14 rounded-full" />
            <h1 className="flex justify-center mx-auto">{user.displayName}</h1>
            <span className="flex justify-center mx-auto font-semibold mb-1">{user.role}</span>
            <div className="block w-full mx-auto bg-gray-300 rounded-md max-h-40 p-2">
                <div className="bg-white rounded-md px-1 py-0.5 text-sm my-2">
                    <span className="block text-blue-600 font-semibold">{user.email}</span>
                </div>
                <div className="bg-white rounded-md px-1 py-0.5 text-sm my-2">
                    <span className="block text-blue-600 font-semibold">{getDateTime(new Date().toString())}</span>
                </div>
                <div className="bg-white rounded-md px-1 py-0.5 text-sm my-2">
                    <span className="block text-blue-600 font-semibold ">{getDateTime(new Date().toString())}</span>
                </div>
            </div>

            {
                updateRoleDialog && 
                <UpdateUserRole 
                    id={user.id}
                    onClose={updateRoleDialogOnChange}
                />
            }
        </div>
    )
}