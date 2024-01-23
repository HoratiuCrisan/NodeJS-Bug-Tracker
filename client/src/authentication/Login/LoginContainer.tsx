import React, {useState} from 'react'
import { LoginForm } from './LoginForm'
import { auth } from '../../config/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import {useNavigate} from 'react-router-dom'

interface FormData {
    email: string
    password: string
}

/**
 * Responsible for sending login information to db
 * 
 * - Getting the login information from login container and sending it to the firebase db
 */

export const LoginContainer: React.FC = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    })

    const [formError, setFormError] = useState<null | string>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData({...formData, [name] : value})
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        console.log(formError)

        try {
            const verifyEmailLogin = await signInWithEmailAndPassword(auth, formData.email, formData.password)

            if (verifyEmailLogin) {
                console.log("aici")
                navigate("/")
            }
            
            //console.log(auth.onAuthStateChanged((userCred) => console.log(userCred)))
        } catch (error) {
            console.error("Failed to login with email and password: " + error)
            setFormError("Invalid credentials!")
        }
    }


    return (
        <LoginForm 
            formData={formData}
            formError={formError}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
        />
    )
}
