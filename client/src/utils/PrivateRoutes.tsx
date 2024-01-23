import React, {useEffect} from 'react'
import {Outlet, Navigate} from 'react-router'
import { useAuth } from '../config/AuthContext'


export const PrivateRoutes = () => {
    const {currentUser, loading} = useAuth()
    
    if (loading) {
        return <div>Loading...</div>
    }

    if (!currentUser) {
        return <Navigate to={"/login"} />
    }

    return <Outlet />
}