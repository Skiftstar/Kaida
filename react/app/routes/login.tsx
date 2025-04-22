import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useUser } from "~/contexts/UserContext"
import { getCurrentUser, login } from "~/util/Api"

export default function LoginRoute() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const { setUser } = useUser()
  const nav = useNavigate()

  const handleLogin = async () => {
    console.log(username, password)
    const loginResponse = await login(username, password)
    console.log(loginResponse)
    if (!loginResponse) {
      return
    }

    setUser(loginResponse)
    nav("/")
  }

  return (
    <div className="h-[100vh] flex flex-col">
      <div className="flex flex-col items-center justify-center gap-5 mt-10">
        <img
          src="logo.svg"
          alt="logo"
          className="w-[200px] h-[200px] rounded-full"
        />
        <div className="text-3xl">
          <span>Welcome to </span>
          <span className="font-bold">Kaida</span>
        </div>
      </div>
      <div className="m-4 flex flex-col gap-2">
        <input
          className="textInput text-xl rounded p-2 w-full max-w-md pointer-events-auto"
          placeholder="Username"
          type="text"
          name="username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <input
          className="textInput text-lg rounded p-2 w-full max-w-md pointer-events-auto"
          placeholder="Password"
          type="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </div>
      <div className="mt-auto w-full">
        <button
          onClick={handleLogin}
          className="w-full h-12 bg-blue-500 text-white pointer-events-auto"
        >
          Login
        </button>
      </div>
    </div>
  )
}
