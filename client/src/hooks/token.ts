import axios from "axios";
import { User, getAuth } from "firebase/auth";
import { useEffect, useRef, useState } from "react";

/* Globla variable to track initalization */
let interceptorsSetUp = false;

const useAxiosInterceptors = () => {
    const isSetUpRef = useRef(interceptorsSetUp);
    const [userDetails, setUserDetails] = useState<User | null>(null);

    useEffect(() => {
        const setupAxiosInterceptors = () => {
            const auth = getAuth(); 

            const getUserDetails = async (user : User) => {
                const tokenResult = await user.getIdTokenResult();

                return {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    role: tokenResult.claims.role || null,
                    emailVerified: user.emailVerified,
                    phoneNumber: user.phoneNumber,
                    isAnonymous: user.isAnonymous,
                    metadata: user.metadata,
                    providerData: user.providerData,
                    delete: user.delete,
                    refreshToken: user.refreshToken,
                    reload: user.reload,
                    getIdToken: user.getIdToken,
                    tenantId: user.tenantId,
                    getIdTokenResult: user.getIdTokenResult, 
                    toJSON: user.toJSON, 
                    photoURL: user.photoURL, 
                    providerId: user.providerId,
                };
            };
            
    
            const getIdToken = async (forceRefresh = false) => {
                /* Get the current user from firebase */
                const user = auth.currentUser;
    
                /* If no user is logged in, throw an error message */
                if (!user) {
                    throw new Error("Error! User is not authenticated! Please login!");
                }

                const currentDetails = await getUserDetails(user);

                if (forceRefresh || !userDetails || JSON.stringify(currentDetails) !== JSON.stringify(userDetails)) {
                    setUserDetails(currentDetails);

                    return await user.getIdToken(true);
                }
                /* Return the JWT token of the current user */
                return await user.getIdToken();
            };
            
            axios.interceptors.request.use(async (config) => {
                try {
                    /* Call the function above to get the current user token */
                    const token = await getIdToken();
                    console.log(token); 
                    
                    /* Add the token to the axios to use for each request */
                    config.headers.Authorization = `Bearer ${token}`;
                } catch (error) {
                    /* Return an error message if the token could not be set */
                    console.error("Error! Could not get the token ID: ", error);
                }

                return config;
            }, (error) => {
                return Promise.reject(error);
            });
        };

        /* If the inteceptors signal is not set, call the function and change the state of the signal */
        if (!interceptorsSetUp) {
            setupAxiosInterceptors();
            interceptorsSetUp = true;
            isSetUpRef.current = true;
        }
    }, []);
};

export { useAxiosInterceptors}