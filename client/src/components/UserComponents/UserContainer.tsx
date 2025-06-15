import React, {useState, useEffect, useContext} from "react";
import { ErrorDialog } from "../ErrorDialog";
import { getUsers } from "../../api/users";
import { User } from "../../types/User";
import { UserCard } from "./UserCard";
import { UserContext } from "../../context/UserProvider";

type UserContainerType = {
    orderBy: string;
    orderDirection: string;
    limit: number;
};

export const UserContainer: React.FC<UserContainerType> = ({orderBy, orderDirection, limit}) => {
    const {onlineUsers} = useContext(UserContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<User[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
    const [error, setError] = useState<null | string>(null);
    const [errorDialog, setErrorDialog] = useState<boolean>(false);

    useEffect(() => {
        const fetchUsersData = async () => {
            try {
                const response: User[] = await getUsers(orderBy, orderDirection, limit, startAfter);

                const usersWithStatus = response.map((user) => ({
                    ...user,
                    status: onlineUsers.includes(user.id) ? "online" as const: "offline" as const,
                }));

                setUsers(usersWithStatus)

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
    }, [isLoading, orderBy, orderDirection, limit, onlineUsers]);

    useEffect(() => {
        console.log(onlineUsers)
        setUsers((prevUsers) =>
            prevUsers.map((user) => ({
                ...user,
                status: onlineUsers.includes(user.id) ? "online" : "offline",
            }))
        );
  }, [onlineUsers]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
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
