import { auth, dataBase } from "../../config/firebase"
import { doc, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import {setUserRole} from "../../api/users"; 

const createUser = async (email: string, password: string, displayName: string, photoURL: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        /* Get the user credentials */
        const user = userCredential.user;

        /* Set the default profile photo and set the username */
        await updateProfile(user, {
            displayName: displayName,
            photoURL: photoURL
        });

        /* Get the user from the firebase based on the user id */
        const userDocRef = doc(dataBase, `Users/${user.uid}`);

        /* Set the mail, username, photoURL and the role for the user */
        await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            displayName: displayName,
            photoURL: photoURL,
            role: "user"
        });

        /* Set the claims for the user */

        const response = await setUserRole(user.uid, "user");

        
        /* Refresh the token to apply the new claims */
        if (response) {
            await user.getIdToken(true);
            console.log("token " + await user.getIdToken());
        }

        return user;
    } catch (error: unknown) {
        if (error instanceof Error) { 
            switch(error.message) {
                case 'auth/email-already-in-use':
                    return `Email address already in use`
                case 'auth/invalid-email':
                    return  `Email address is invalid`
                case 'auth/operation-not-allowed':
                    return `Error during sign up!`
                case 'auth/weak-password':
                    return `Password is not strong enaug!`
                default:
                    return  error.message
            } 
        } else {
            return "An unknown error occured";
        }
    }
}

export {createUser}