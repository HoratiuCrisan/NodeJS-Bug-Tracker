import React, {useState} from 'react'
import RegisterForm from './RegisterForm'
import {
     usernameValidation,
     passwordValidation
} from './RegistrationValidation'
import {createUser} from './createUser'
import { updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

interface FormData {
    username: string
    email: string
    password: string
}

interface Errors {
    username: string
    password: string
}

/**
 * Responsible for manipulating the register form dota
 * 
 * - tests the form data to check the validity
 * - allows user to be registered if the registration data is valid 
 */

export const RegistrationContainer: React.FC = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState<Errors>({
        username: '',
        password: '',
    })

    const [userRegistrationError, setUserRegistrationError] = useState<string | null>(null)

    const usernameErrorMessage = 'Your username should start with a letter. ' +
        'Your username length can be between 4-12 characters long.' + 
        'Your username can contain upper and lower case letters.' +
        'Your username can contain `_` and `-` .'

    const passwordErrorMessage = 'Your password should contain between 6-24 characters. ' +
        'Your password should contain a lower case letter, an upper case letter, a digit and a symbol.'

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData({...formData, [name] : value})

        //Validate input data
        validateInputData(name, value)
    }

    const validateInputData = (name: string, value: string) => {
        let error = ''

        switch (name) {
            case 'username':
                error = usernameValidation(value) ? '' : usernameErrorMessage
                break
            case 'password':
                error = passwordValidation(value) ? '' : passwordErrorMessage
                break
            default:
                break
        }

        setErrors({...errors, [name] : error})
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        setUserRegistrationError(null)
        //Reset the form error message

        //Checking for errors before submitting
        if (Object.values(errors).every((error) => error === '')) {
            
            const response = await createUser(formData.email, formData.password)
            
            if (typeof response === 'string') {
                setUserRegistrationError(response)
                return
            }

            else {
                updateProfile(response, {
                    displayName: formData.username, photoURL: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                })
                navigate("/")
            }

            
        } else 
            console.log("Registration form has error, please try again")   
    }


    return (
        <RegisterForm
            formData={formData}
            registrationError={userRegistrationError}
            errors={errors}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
        />
    )
}
