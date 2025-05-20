import React, {useState, useEffect} from "react";
import { ErrorDialog } from "../ErrorDialog";
import { getUsers } from "../../api/users";
import { User } from "../../types/User";
import { UserCard } from "./UserCard";

type UserContainerType = {
    orderBy: string;
    orderDirection: string;
    limit: number;
};

export const UserContainer: React.FC<UserContainerType> = ({orderBy, orderDirection, limit}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<User[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
    const [error, setError] = useState<null | string>(null);
    const [errorDialog, setErrorDialog] = useState<boolean>(false);

    useEffect(() => {
        const fetchUsersData = async () => {
            try {
                const response: User[] = await getUsers(orderBy, orderDirection, limit, startAfter);

                setUsers(response);

                /* Set the ID of the last user retrieved */
                setStartAfter(response[response.length - 1].id);
            } catch (error) {
                setError(`Failed to retrieve users`);
                setErrorDialog(true);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        if (isLoading) {
            fetchUsersData();
        }
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4">
            {users.map((user: User, index) => (
                <UserCard
                    key={index} 
                    user={user}
                /> 
            ))}

            {errorDialog && error && <ErrorDialog text={error} onClose={() => {setErrorDialog(false); setError(null)}}/>}
        </div>
    )
}
