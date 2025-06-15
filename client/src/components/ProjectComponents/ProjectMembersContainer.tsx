import React, { useContext, useEffect } from 'react'
import { User } from '../../types/User'
import { UserContext } from '../../context/UserProvider';
import defaultPhoto from "../../Images/default-user-photo.svg";

type ProjectMembersContainerType = {
    manager: User;
    members: User[];
};

export const ProjectMembersContainer: React.FC<ProjectMembersContainerType> = ({manager, members}) => {
    const {onlineUsers} = useContext(UserContext);
    useEffect(() => {}, [manager, members, onlineUsers]);

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-11/12 bg-white my-4 mx-auto p-4">
            <h1 className="font-bold text-lg my-2">Project members:</h1>
            <table className="w-full text-sm text-left rtl:text-right text-gray-100 dark:text-gray-400 rounded-md">
                <thead className="text-sm text-gray-100 uppercase bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Position
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-gray-100 border-b border-gray-200 hover:bg-gray-300">
                        <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                            <img 
                                src={manager.photoUrl} 
                                alt="manager photo"
                                onError={(e) => e.currentTarget.src=`${defaultPhoto}`} 
                                className="w-10 h-10 rounded-full" 
                            />
                            <div className="ps-3">
                                <h1 className="text-base font-semibold">{manager.displayName}</h1>
                                <h6 className="font-normal text-gray-500">{manager.email}</h6>
                            </div>
                        </th>  
                        <td className="px-6 py-4 text-slate-500 font-medium">
                            {manager.role}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                            <div className="flex items-center">
                                {onlineUsers.includes(manager.id)  ? 
                                    <><span className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></span>online</> 
                                    :
                                    <><span className="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></span>offline</>
                                }
                            </div>
                        </td>
                    </tr>

                    {members.map((member) => (
                        <tr className="bg-gray-100 border-b border-gray-200 hover:bg-gray-300" key={member.id}>
                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                                <img 
                                    src={member.photoUrl} 
                                    alt="manager photo"
                                    onError={(e) => e.currentTarget.src=`${defaultPhoto}`} 
                                    className="w-10 h-10 rounded-full" 
                                />
                                <div className="ps-3">
                                    <h1 className="text-base font-semibold">{member.displayName}</h1>
                                    <h6 className="font-normal text-gray-500">{member.email}</h6>
                                </div>
                            </th>  
                            <td className="px-6 py-4 text-slate-500 font-medium">
                                {member.role}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">
                                <div className="flex items-center">
                                    {onlineUsers.includes(member.id) ?
                                        <><span className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></span>online</> 
                                        :
                                        <><span className="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></span>offline</>
                                    }
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
