import React from 'react'
import {Outlet, Navigate} from 'react-router'
import { useAuth } from '../config/AuthContext'
import { getAuth } from 'firebase/auth'


export const PrivateRoutes = () => {
    const {currentUser, loading} = useAuth()
    
    if (loading || !currentUser) {
        return <div>Loading...</div>
    }

    if (!currentUser) {
        return <Navigate to={"/login"} />
    }

    return <Outlet />
}