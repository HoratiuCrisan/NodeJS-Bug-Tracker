import React, { useEffect, useRef, useState } from "react";
import { updateRole, getUserById } from "../../api/users";
import {IoCloseOutline} from 'react-icons/io5';
import { User } from "../../types/User";
import {roleOptions} from "../../utils/selectOptions";
import { ErrorDialog } from "../ErrorDialog";
import Select from "react-select";

type UpdateUserRoleType = {
    id: string;
    onClose: (value: boolean) => void;
}

export const UpdateUserRole: React.FC<UpdateUserRoleType> = ({id, onClose}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [errorDialog, setErrorDialog] = useState<boolean>(false);

    useEffect(() => {
        const getUserData = async () => {
            try {
                /* Send the request to retrieve the data of a user based on the ID */
                const response: User = await getUserById(id);

                /* Set the user state to the response data */
                setUser(response);
            } catch (error) {
                setError(`Failed to retrieve user data`);
                setErrorDialog(true);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        /* If the data was not retrieved, send the fetching request */
        if (isLoading) {
            getUserData();
        } 
    }, [id]);

    const handleUserRoleUpdate = async () => {
        try {
            /* If the user data was not retrieved send an error and exit */
            if (!role || !user) {
                setError(`Unauthorized user`);
                setErrorDialog(true);
                return;
            } 

            /* If the user already has the role, send an error */
            if (role === user.role) {
                setError(`${user.displayName} already has the role of ${user.role}`);
                setErrorDialog(true);
                return;
            }

            /* Send the update request to the server */
            const response: User = await updateRole(user.id, role, user.email);

            /* Update the current user data */
            setUser(response);

            /* Close the update dialog */
            onClose(false);
        } catch (error) {
            setError(String(error));
            setErrorDialog(true);
            return;
        }
    }

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 h-full">
            <div className="w-3/4 lg:w-3/6 xl:w-2/6 bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className='block justify-center mx-auto w-full bg-gray-50'>
                    <div className='flex w-full justify-end items-end text-end'>
                        <IoCloseOutline 
                            onClick={() => onClose(false)}
                            className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                            aria-label="Open update role dialog"
                            size={24}
                            role="button"
                            tabIndex={0}
                        />
                    </div>

                    <h1 className='flex justify-center mx-auto text-lg font-semibold mb-4'>
                        {`Update ${user.displayName}'s role`}
                    </h1>

                    <Select 
                        defaultValue={roleOptions.find(opt => opt.value === user.role)}
                        options={roleOptions.filter(opt => opt.value !== user.role)}
                        onChange={(option) => setRole(option?.value)}
                    />

                    <div className="flex justify-end pt-6">
                        <button 
                            className="bg-red-500 text-white rounded-md mx-2 p-2"
                            onClick={() => onClose(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="bg-green-500 text-white rounded-md mx-2 p-2"
                            onClick={handleUserRoleUpdate}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>

            {errorDialog && error && <ErrorDialog text={error} onClose={() => {setErrorDialog(false); setError(null)}}/>}
        </div>
    )
}