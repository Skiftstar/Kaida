import { createContext, useContext } from "react"
import type { User } from "~/types"

type UserContextType = {
  user: User | undefined
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within a UserProvider")
  return ctx
}
