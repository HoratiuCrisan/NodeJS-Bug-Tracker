import React, { ReactNode } from 'react'
import { auth, googleProvider } from '../config/firebase'
import { signInWithPopup } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

/**
 * Responsible for allowing the user to register with his Google account
 * 
 */
interface Props {
    text: string
    icon?: ReactNode
}

export const GoogleAuth: React.FC<Props> = ({text, icon}) => {
    const navigate = useNavigate()
    const connectWithGoogle = async () => {
        try {
            const response = await signInWithPopup(auth, googleProvider)
            
            if (await response) {
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
