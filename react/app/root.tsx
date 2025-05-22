import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'
import './index.css'
import 'react-datepicker/dist/react-datepicker.css'
import { SideLayout } from './components/Layout'
import { useEffect, useState } from 'react'
import { getCurrentUser } from './util/Api'
import { UserContext } from './contexts/UserContext'
import type { User } from './types'
import { ToastContext } from './contexts/ToastContext'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
  }
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [initialized, setInitialized] = useState(false)
  const [initFailed, setInitFailed] = useState(false)
  const [toast, setToast] = useState<string | undefined>(undefined)
  const [toastInitialized, setToastInitialized] = useState(false)
  const [toastTimer, setToastTimer] = useState<NodeJS.Timeout | undefined>(
    undefined
  )
  const INIT_TIMEOUT = 10000
  const TOAST_DELAY = 3000

  const nav = useNavigate()

  useEffect(() => {
    getCurrUser()
    setTimeout(() => {
      if (!initialized) {
        setInitFailed(true)
      }
    }, INIT_TIMEOUT)
  }, [])

  const getCurrUser = async () => {
    const user = await getCurrentUser()

    setInitialized(true)
    if (!user) {
      if (window.location.pathname !== '/login') {
        nav('/login')
      }
      return
    }
    if (window.location.pathname === '/login') {
      nav('/')
    }
    setUser(user)
  }

  const setNewToast = (toast: string) => {
    setToastInitialized(true)
    setToast(toast)
    if (toastTimer) clearTimeout(toastTimer)
    const timer = setTimeout(() => {
      setToast(undefined)
    }, TOAST_DELAY)
    setToastTimer(timer)
  }

  return initialized ? (
    <UserContext.Provider value={{ user, setUser }}>
      <ToastContext.Provider value={{ setToast: setNewToast }}>
        <div
          className={`toast ${toast ? 'toast-open' : 'toast-closed'} ${
            toastInitialized ? 'block' : 'hidden'
          } absolute flex w-full justify-center items-center z-30 min-h-[20px]`}
        >
          <div className="!bg-red-400 rounded p-2 !text-white flex items-center justify-center w-1/3 h-full">
            <span className="text-center">{toast}</span>
          </div>
        </div>
        <SideLayout />
      </ToastContext.Provider>
    </UserContext.Provider>
  ) : (
    <div>{initFailed && <span>Init failed!</span>}</div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
