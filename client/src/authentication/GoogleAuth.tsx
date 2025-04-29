import React from 'react'
import { auth, googleProvider, dataBase } from '../config/firebase'
import { signInWithPopup } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import {GoogleUser} from '../utils/types/User'
import {doc, getDoc, setDoc} from 'firebase/firestore'
import { setUserRole } from '../api/users'

/**
 * Responsible for allowing the user to register with his Google account
 * 
 */

export const GoogleAuth: React.FC<GoogleUser> = ({text, icon}) => {
    const navigate = useNavigate()
    const connectWithGoogle = async () => {
        try {
            const response = await signInWithPopup(auth, googleProvider)
            
            if (response) {
                const user = response.user
                const userId = user.uid
                const userDocRef = doc(dataBase, `Users/${userId}`)
                const userDoc = await getDoc(userDocRef)

                if (!userDoc.exists()) {
                    await setDoc(userDocRef, {
                        id: userId,
                        email: user.email,
                        displayName: user.displayName,
                        role: "user",
                        photoUrl: user.photoURL,
                    })

                    const response = await setUserRole(user.uid, "user");

                    if (response) {
                        await user.getIdToken(true);
                    }
                }

                navigate("/")
            }
        } catch (error) {
            console.error("Failed to register with Google: " + error)
        }
    }

    return (
        <div onClick={connectWithGoogle} className='flex'>
            {icon} {text}
        </div>
    )
}
