import { createContext, useContext } from 'react'

type PageContextType = {
  currPage: string
  setCurrPage: React.Dispatch<React.SetStateAction<string>>
}

export const PageContext = createContext<PageContextType | undefined>(undefined)

export const usePage = () => {
  const ctx = useContext(PageContext)
  if (!ctx) throw new Error('usePage must be used within a PageProvider')
  return ctx
}
