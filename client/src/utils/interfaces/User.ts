import { ReactNode } from "react"

export interface User {
    id: string
    displayName: string
    email: string
    role: string
    photoUrl: string
    status: string
    lastConnected: Date
    lastDisconnected: Date
}

export interface FormData {
    email: string
    password: string
}

export interface LoginFormProps {
    formData: FormData
    formError: string | null
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: React.FormEvent) => void
}

export interface GoogleUser {
    text: string
    icon?: ReactNode;
}

export interface RegisterFormData {
    username: string
    email: string
    password: string
}

export interface UserFormErrors {
    username: string
    password: string
}