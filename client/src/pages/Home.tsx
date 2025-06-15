import { useEffect, useState, useContext} from "react";
import { FaRegEnvelope } from "react-icons/fa6";
import { DisplayedTicket } from "../components/TicketComponents/DisplayedTicket";
import { UserContext } from "../context/UserProvider";

export const Home = () => {
    /* Import the loading and user data from the user provider */
    const { user, loading } = useContext(UserContext);
   
    if (loading || !user) {
        return <div>Loading...</div>
    }    

    return (
        <div className='px-4 lgpx-0 block mt-4 lg:pl-10'>
            <div className='flex text-xl font-semibold font-sans'>
                <span className='mt-1 text-2xl'>
                    <FaRegEnvelope />
                </span>
                
                <h1 className='mx-2'>
                    {user.displayName}'s tickets
                </h1>
            </div>

            <div className='my-8'>
                <DisplayedTicket />
            </div>
      </div>
    )
}