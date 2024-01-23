import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

interface AuthContextProps {
  children: ReactNode
}

interface AuthContextValue {
  currentUser: User | null
  loading: boolean
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<AuthContextProps> = ({ children }) => {
  const currentUserRef = useRef<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      currentUserRef.current = currentUser
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signOutUser = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error at signing out", error)
    }
  }

  const contextValue: AuthContextValue = {
    currentUser: currentUserRef.current,
    loading,
    signOutUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
