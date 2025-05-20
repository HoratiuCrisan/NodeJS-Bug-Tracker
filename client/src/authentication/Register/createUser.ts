import { auth, dataBase } from "../../config/firebase"
import { doc, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword, updateProfile, User } from "firebase/auth"
import {createNewUser} from "../../api/users"; 

/**
 * 
 * @param {string} email The email address of the user
 * @param {string} password The password of the user
 * @param {string} displayName The username of the user
 * @param {string} photoURL The profile photo of the user
 * @returns {User} The firebase user data
 */
const createUser = async (email: string, password: string, displayName: string, photoURL: string): Promise<User> => {
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

        if (!user.email) {
            throw new Error(`User email was not rechieved`);
        }

        /* Add the user into the users collection */
        await createNewUser(user.uid!, email, displayName, photoURL);

        return user;
    } catch (error: any) {
        if (error.code) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    throw new Error(`Email address already in use`);
                case "auth/invalid-email":
                    throw new Error(`Email address is invalid`);
                case "auth/operation-not-allowed":
                    throw new Error(`Error during sign up, operation not allowed`);
                case "auth/weak-password":
                    throw new Error(`Password is too weak`);
                default:
                    throw new Error(error.message || `An unexpected error occured during the sign up process `);
            }     
        } else {
            throw new Error(`An unknown error occured`);
        }
    }
}

export {createUser}