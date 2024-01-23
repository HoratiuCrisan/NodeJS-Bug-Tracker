import { auth } from "../../config/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"

const createUser = async (email: string, password: string) => {
   return await  createUserWithEmailAndPassword(auth, email, password)
    .then(user => {
        return user.user
    })
    .catch(error => {
        switch(error.code) {
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
    })
}

export {createUser}