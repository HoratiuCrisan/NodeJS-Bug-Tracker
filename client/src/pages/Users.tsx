import React, {useEffect, useState} from 'react';
import { UserContainer } from '../components/UserComponents/UserContainer';
import Select, { SingleValue } from 'react-select';
import convertTimestampToDate from '../utils/TimestampToDate';
import { selectStyles, customStyles } from '../utils/Select-Styles';


export const Users = () => {
    const [searchText, setSearchText] = useState<string>('');

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    return (
        <div className='lg:pl-10 h-screen'>
            <div className='flex w-11/12 my-6'>
                <input 
                    type="text" 
                    placeholder='Search for a user...'
                    value={searchText}
                    onChange={handleSearch}
                    className='w-2/4 lg:w-2/5 3xl:w-1/5 border-2 border-gray-300 text-gray-600 rounded-md ml-10 2xl:ml-24 px-2'
                />


            </div>
           <div className='w-11/12 rounded-lg mx-auto'>
                <UserContainer 
                    orderBy='email'
                    orderDirection='asc'
                    limit={10}
                />
           </div>
        </div>
    )
}
