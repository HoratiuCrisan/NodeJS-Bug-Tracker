import React from 'react'
import { setDoc, doc, getDoc } from 'firebase/firestore';
import {auth, dataBase, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth'
import {GoogleUser} from '../types/User'
import { useNavigate } from 'react-router-dom';
import { createNewUser, getUserById, loginUser } from '../api/users';


/**
 * Responsible for allowing the user to register with his Google account
 * 
 */

export const GoogleAuth: React.FC<GoogleUser> = ({text, icon}) => {
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);

            if (!result) {
                console.log("No redirect result (user didn't come from Google sign-in)");
                return;
            }

            const user = result.user;
            const userRef = doc(dataBase, `Users/${user.uid}`);
            const userDoc = await getDoc(userRef);

            /* Check if the user exists */
            if (!userDoc.exists) {
                await setDoc(userRef, {
                    id: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    role: "user",
                    photoUrl: user.photoURL,
                });
            } 

            if (!await getUserById(user.uid)) {
                await createNewUser(user.uid!, user.email!, user.displayName!, user.photoURL!);
            }
            

            console.log(await auth.currentUser?.getIdTokenResult());
            /* Redirect to the main page */
            navigate('/');
            
        } catch (error) {
            throw new Error(`Failed to sign in user with google provider: ${JSON.stringify(error)}`,);
        }
    }

    return (
        <div onClick={handleGoogleSignIn} className='flex justify-center w-full mx-auto'>
            {icon} {text}
        </div>
    )
}
