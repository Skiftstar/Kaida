import {
  data,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node"

import "./index.css"
import "./tailwind.css"
import { SideLayout } from "~/components/Layout"
import { useState } from "react"
import { getCurrentUser } from "./util/Api"

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser()

  const url = new URL(request.url)
  const pathname = url.pathname
  if (pathname.includes("/login")) {
    return data({ user: null })
  }

  // if (!user) {
  //   return redirect("/login")
  // }

  return data({ user })
}

export default function App() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div>
      <SideLayout isLoggedIn={user !== null} />
    </div>
  )
}
