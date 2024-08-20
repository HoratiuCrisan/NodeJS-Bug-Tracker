import { useEffect, useState} from "react";
import { FaRegEnvelope } from "react-icons/fa6";
import { DisplayedTicket } from "../components/TicketComponents/DisplayedTicket";
import { useAxiosInterceptors } from "../hooks/token";
import { User, getAuth, onAuthStateChanged} from "firebase/auth";

export const Home = () => {
    const [user, setUser] = useState<User | null>(null); /* Hold the user */
    const auth = getAuth(); /* Get the auth */
    const [isLoading, setIsLoading] = useState<boolean>(true); /* Load until the page is loaded */

    useAxiosInterceptors();

    useEffect(() => {
        /* If the user is logged in set the current user */
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            user ? setUser(user) : setUser(null);
        });

        /* Stop the loading process */
        setIsLoading(false);

        /* Call the method when authenticated */
        return () => unsubscribe();
    }, [auth]);

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className='block mt-4 lg:pl-10'>
            <div className='flex text-xl font-semibold font-sans'>
                <span className='mt-1 text-2xl'>
                    <FaRegEnvelope />
                </span>
                
                <h1 className='mx-2'>
                    {user?.displayName}'s tickets
                </h1>
            </div>

            <div className='my-8'>
                <DisplayedTicket />
            </div>
      </div>
    )
}