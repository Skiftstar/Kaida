import { createContext, useContext } from 'react'

type ToastContextType = {
  setToast: (toast: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
