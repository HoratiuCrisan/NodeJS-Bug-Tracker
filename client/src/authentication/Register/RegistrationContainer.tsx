import React, { useState } from 'react';
import RegisterForm from './RegisterForm';
import {
    usernameValidation,
    passwordValidation
} from './RegistrationValidation';
import { createUser } from './createUser';
import { useNavigate } from 'react-router-dom';
import { RegisterFormData, UserFormErrors } from '../../utils/interfaces/User';
import DefaultImage from '../../Images/ProfileImage.jpg'

/**
 * Responsible for manipulating the register form data
 * 
 * - tests the form data to check the validity
 * - allows user to be registered if the registration data is valid 
 */

export const RegistrationContainer: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<UserFormErrors>({
        username: '',
        password: '',
    });

    const [userRegistrationError, setUserRegistrationError] = useState<string | null>(null);

    const usernameErrorMessage = 'Your username should start with a letter. ' +
        'Your username length can be between 4-12 characters long.' + 
        'Your username can contain upper and lower case letters.' +
        'Your username can contain `_` and `-`.';

    const passwordErrorMessage = 'Your password should contain between 6-24 characters. ' +
        'Your password should contain a lower case letter, an upper case letter, a digit and a symbol.';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate input data
        validateInputData(name, value);
    };

    const validateInputData = (name: string, value: string) => {
        let error = '';

        switch (name) {
            case 'username':
                error = usernameValidation(value) ? '' : usernameErrorMessage;
                break;
            case 'password':
                error = passwordValidation(value) ? '' : passwordErrorMessage;
                break;
            default:
                break;
        }

        setErrors({ ...errors, [name]: error });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setUserRegistrationError(null);
        // Reset the form error message

        // Checking for errors before submitting
        if (Object.values(errors).every((error) => error === '')) {
            const response = await createUser(
                formData.email, 
                formData.password, 
                formData.username,
                DefaultImage
            );

            if (typeof response === 'string') {
                setUserRegistrationError(response);
                return;
            } else {
                navigate("/");
            }
        } else {
            console.log("Registration form has errors, please try again");
        }
    };

    return (
        <RegisterForm
            formData={formData}
            registrationError={userRegistrationError}
            errors={errors}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
        />
    );
};
