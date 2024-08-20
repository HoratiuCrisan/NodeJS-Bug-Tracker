import React, {useEffect, useState} from 'react'
import { getAllUsers } from '../api/users'
import { User } from '../utils/interfaces/User'
import UserTable from '../components/UserComponents/UserTable';
import Select, { SingleValue } from 'react-select';
import convertTimestampToDate from '../utils/TimestampToDate';
import { selectStyles, customStyles } from '../utils/Select-Styles';

const usersPerPage = [
    {label: "10", value: 10},
    {label: "25", value: 25},
    {label: "50", value: 50}
];

const sortOptions = [
    {label: "Username", value: "Username"},
    {label: "Email", value: "Email"},
    {label: "Role", value: "Role"},
    {label: "Last connection", value: "Last connection"},
    {label: "Last disconnection", value: "Last disconnection"}
]

const gusers = [
    {
        id: '1',
        displayName: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        role: 'Admin',
        photoUrl: 'https://via.placeholder.com/150?text=A',
        status: 'Active',
        lastConnected: { _seconds: 1719142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1719146941, _nanoseconds: 153000000 },
    },
    {
        id: '2',
        displayName: 'Bob Smith',
        email: 'bob.smith@example.com',
        role: 'User',
        photoUrl: 'https://via.placeholder.com/150?text=B',
        status: 'Inactive',
        lastConnected: { _seconds: 1718142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1718146941, _nanoseconds: 153000000 },
    },
    {
        id: '3',
        displayName: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        role: 'Moderator',
        photoUrl: 'https://via.placeholder.com/150?text=C',
        status: 'Active',
        lastConnected: { _seconds: 1717142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1717146941, _nanoseconds: 153000000 },
    },
    {
        id: '4',
        displayName: 'Diana Prince',
        email: 'diana.prince@example.com',
        role: 'Admin',
        photoUrl: 'https://via.placeholder.com/150?text=D',
        status: 'Active',
        lastConnected: { _seconds: 1716142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1716146941, _nanoseconds: 153000000 },
    },
    {
        id: '5',
        displayName: 'Eve Adams',
        email: 'eve.adams@example.com',
        role: 'User',
        photoUrl: 'https://via.placeholder.com/150?text=E',
        status: 'Inactive',
        lastConnected: { _seconds: 1715142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1715146941, _nanoseconds: 153000000 },
    },
    {
        id: '6',
        displayName: 'Frank Castle',
        email: 'frank.castle@example.com',
        role: 'Moderator',
        photoUrl: 'https://via.placeholder.com/150?text=F',
        status: 'Active',
        lastConnected: { _seconds: 1714142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1714146941, _nanoseconds: 153000000 },
    },
    {
        id: '7',
        displayName: 'Grace Hopper',
        email: 'grace.hopper@example.com',
        role: 'Admin',
        photoUrl: 'https://via.placeholder.com/150?text=G',
        status: 'Active',
        lastConnected: { _seconds: 1713142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1713146941, _nanoseconds: 153000000 },
    },
    {
        id: '8',
        displayName: 'Hank Pym',
        email: 'hank.pym@example.com',
        role: 'User',
        photoUrl: 'https://via.placeholder.com/150?text=H',
        status: 'Inactive',
        lastConnected: { _seconds: 1712142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1712146941, _nanoseconds: 153000000 },
    },
    {
        id: '9',
        displayName: 'Ivy Lane',
        email: 'ivy.lane@example.com',
        role: 'Moderator',
        photoUrl: 'https://via.placeholder.com/150?text=I',
        status: 'Active',
        lastConnected: { _seconds: 1711142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1711146941, _nanoseconds: 153000000 },
    },
    {
        id: '10',
        displayName: 'Jack Ryan',
        email: 'jack.ryan@example.com',
        role: 'Admin',
        photoUrl: 'https://via.placeholder.com/150?text=J',
        status: 'Active',
        lastConnected: { _seconds: 1710142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1710146941, _nanoseconds: 153000000 },
    },
    {
        id: '11',
        displayName: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        role: 'Admin',
        photoUrl: 'https://via.placeholder.com/150?text=A',
        status: 'Active',
        lastConnected: { _seconds: 1719142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1719146941, _nanoseconds: 153000000 },
    },
    {
        id: '12',
        displayName: 'Bob Smith',
        email: 'bob.smith@example.com',
        role: 'User',
        photoUrl: 'https://via.placeholder.com/150?text=B',
        status: 'Inactive',
        lastConnected: { _seconds: 1718142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1718146941, _nanoseconds: 153000000 },
    },
    {
        id: '13',
        displayName: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        role: 'Moderator',
        photoUrl: 'https://via.placeholder.com/150?text=C',
        status: 'Active',
        lastConnected: { _seconds: 1717142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1717146941, _nanoseconds: 153000000 },
    },
    {
        id: '14',
        displayName: 'Diana Prince',
        email: 'diana.prince@example.com',
        role: 'Admin',
        photoUrl: 'https://via.placeholder.com/150?text=D',
        status: 'Active',
        lastConnected: { _seconds: 1716142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1716146941, _nanoseconds: 153000000 },
    },
    {
        id: '15',
        displayName: 'Eve Adams',
        email: 'eve.adams@example.com',
        role: 'User',
        photoUrl: 'https://via.placeholder.com/150?text=E',
        status: 'Inactive',
        lastConnected: { _seconds: 1715142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1715146941, _nanoseconds: 153000000 },
    },
    {
        id: '16',
        displayName: 'Frank Castle',
        email: 'frank.castle@example.com',
        role: 'Moderator',
        photoUrl: 'https://via.placeholder.com/150?text=F',
        status: 'Active',
        lastConnected: { _seconds: 1714142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1714146941, _nanoseconds: 153000000 },
    },
    {
        id: '17',
        displayName: 'Grace Hopper',
        email: 'grace.hopper@example.com',
        role: 'Admin',
        photoUrl: 'https://via.placeholder.com/150?text=G',
        status: 'Active',
        lastConnected: { _seconds: 1713142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1713146941, _nanoseconds: 153000000 },
    },
    {
        id: '18',
        displayName: 'Hank Pym',
        email: 'hank.pym@example.com',
        role: 'User',
        photoUrl: 'https://via.placeholder.com/150?text=H',
        status: 'Inactive',
        lastConnected: { _seconds: 1712142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1712146941, _nanoseconds: 153000000 },
    },
    {
        id: '19',
        displayName: 'Ivy Lane',
        email: 'ivy.lane@example.com',
        role: 'Moderator',
        photoUrl: 'https://via.placeholder.com/150?text=I',
        status: 'Active',
        lastConnected: { _seconds: 1711142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1711146941, _nanoseconds: 153000000 },
    },
    {
        id: '20',
        displayName: 'Jack Ryan',
        email: 'jack.ryan@example.com',
        role: 'Admin',
        photoUrl: 'https://via.placeholder.com/150?text=J',
        status: 'Active',
        lastConnected: { _seconds: 1710142941, _nanoseconds: 953000000 },
        lastDisconnected: { _seconds: 1710146941, _nanoseconds: 153000000 },
    }
];



export const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [numberOfUsers, setNumberOfUsers] = useState<{label: string, value: number}>(usersPerPage[0]);
    const [searchText, setSearchText] = useState<string>('');
    const [usrs, setUsrs] = useState(gusers)
    const [filteredUsers, setFilteredUsers] = useState(gusers);
    const [sortKey, setSortKey] = useState<{label: string, value: string}>(sortOptions[0]);

    useEffect(() => {
        const data = gusers.filter(user => 
            user.displayName.toLowerCase().includes(searchText) ||
            user.email.toLowerCase().includes(searchText) ||
            user.role.toLowerCase().includes(searchText)
        );

        console.log(data);
        setFilteredUsers(data);
    }, [searchText])

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    useEffect(() => {
        //fetchUsers();
    }, [])

    const fetchUsers = async () => {
        const response = await getAllUsers();

        if (response) {
            setUsers(response.users);
        }
    }

    const handleUsersNumberOfUsers = (e: SingleValue<{label: string, value: number}>) => {
        if (!e || !e.label || !e.value) {
            return;
        }

        setNumberOfUsers({label: e.label, value: e.value})
    }

    const handleSortKey = (e: SingleValue<{label: string, value: string}>) => {
        if (!e || !e.label || !e.value) {
            return;
        }

        setSortKey({label: e.label, value: e.value});
    }

    return (
        <div className='lg:pl-10'>
            <div className='flex w-11/12 my-6'>
                <input 
                    type="text" 
                    placeholder='Search for a user...'
                    value={searchText}
                    onChange={handleSearch}
                    className='w-2/4 lg:w-2/5 3xl:w-1/5 border-2 border-gray-300 text-gray-600 rounded-md ml-10 2xl:ml-24 px-2'
                />

                <Select 
                    options={sortOptions}
                    value={sortKey}
                    onChange={handleSortKey}
                    styles={{...selectStyles("#cbd5e1", "#000"), ...customStyles}}
                    className='fixed w-1/4 mx-4'
                />

                <Select 
                    options={usersPerPage}
                    className='fixed w-32'
                    value={numberOfUsers}
                    onChange={handleUsersNumberOfUsers}
                    
                />
            </div>
           <div className='w-11/12 bg-gray-50 rounded-lg shadow-md mx-auto mb-8'>
                <UserTable users={filteredUsers} itemsPerPage={numberOfUsers.value}/>
           </div>
        </div>
    )
}
