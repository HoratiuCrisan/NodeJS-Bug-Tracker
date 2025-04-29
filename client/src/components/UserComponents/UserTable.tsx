import React, {useState, useEffect, ReactNode} from 'react';
import convertTimestampToDate from '../../utils/TimestampToDate';
import { User } from '../../utils/types/User';
import DefaultImage from '../../Images/ProfileImage.jpg';
import Select from 'react-select'

interface UserTableProps {
    users: any[];
    itemsPerPage: number;
}

const UserTable: React.FC<UserTableProps> = ({ users, itemsPerPage }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [users])

    const currentUsers = users.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleUserRolesDisplay = (userRole: string): React.ReactNode => {
        if (!userRole || userRole.length === 0) {
            return <></>
        }

        const role = {label: userRole, value: userRole};

        let upgradeRoles: {label: string, value: string}[]= [];

        switch (userRole.toLocaleLowerCase()) {
            case 'user':
                upgradeRoles = [
                    {label: 'developer', value: 'developer'},
                    {label: 'project-manager', value: 'project-manager'},
                    {label: 'admin', value: 'admin'}
                ];
                break;
            case 'developer':
                upgradeRoles = [
                    {label: 'user', value: 'user'},
                    {label: 'project-manager', value: 'project-manager'},
                    {label: 'admin', value: 'admin'}
                ];
                break;
            case 'project-manager':
                upgradeRoles = [
                    {label: 'user', value: 'user'},
                    {label: 'developer', value: 'developer'},
                    {label: 'admin', value: 'admin'}
                ];
                break;
            case 'admin':
                upgradeRoles = [
                    {label: 'user', value: 'user'},
                    {label: 'developer', value: 'developer'},
                    {label: 'project-manager', value: 'project-manager'}
                ];
                break;
            default:
                return <></>;
        }

        return <div className='flex justify-between'>
            <Select 
                value={role}
                options={upgradeRoles}
                className='w-36'
            />
        </div>
    }

    const handleUserRoleUpdate = () => {
        
    }

    return (
        <div className="rounded-lg">
            <table className="min-w-full bg-white">
                <thead className='bg-gray-800 text-white'>
                    <tr>
                        <th className="px-4 py-2">Image</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Last Connected</th>
                        <th className="px-4 py-2">Last Disconnected</th>
                        <th className='px-4 py-2'>Update Position</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((user) => (
                        <tr key={user.id} className="whitespace-nowrap">
                            <td className="px-4 py-2">
                                <img
                                    src={user.photoUrl ? user.photoUrl : DefaultImage}
                                    alt={user.displayName}
                                    className="rounded-full h-10 w-10"
                                />
                            </td>
                            <td className="px-4 py-2">{user.displayName}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">{user.role}</td>
                            <td className="px-4 py-2">
                                {user.lastConnected && convertTimestampToDate(user.lastConnected).toLocaleString()}
                            </td>
                            <td className="px-4 py-2">
                                {user.lastDisconnected && convertTimestampToDate(user.lastDisconnected).toLocaleString()}
                            </td>
                            <td className='px-4 py-2'>
                                {handleUserRolesDisplay(user.role)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 bg-gray-200 rounded ${
                        currentPage === 1 ? 'cursor-not-allowed' : ''
                    }`}
                >
                    Previous
                </button>
                <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 bg-gray-200 rounded ${
                        currentPage === totalPages ? 'cursor-not-allowed' : ''
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UserTable;