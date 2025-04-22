import { useNavigate } from "react-router"
import { usePage } from "~/contexts/PageContext"
import { useUser } from "~/contexts/UserContext"
import { logoutUser } from "~/util/Api"

export default function ProfileRoute() {
  const { user, setUser } = useUser()
  const nav = useNavigate()

  const { setCurrPage } = usePage()
  setCurrPage("Profile")

  const handleLogout = async () => {
    const successfulLogout = await logoutUser()
    if (successfulLogout) {
      nav("/login")
      setUser(undefined)
    }
  }

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
      <div className="flex flex-col gap-6 m-4">
        <div className="w-full">
          <div className="border-b-1 w-full">
            <span className="text-lg">Email</span>
          </div>
          <span className="flex justify-center font-bold text-xl">
            {user?.email}
          </span>
        </div>
        <div className="w-full">
          <div className="border-b-1 w-full">
            <span className="text-lg">Password</span>
          </div>
          <span className="flex justify-center font-bold text-xl">*******</span>
        </div>
        <div className="w-full">
          <div className="border-b-1 w-full">
            <span className="text-lg">Push-Notifications</span>
          </div>
          <span className="flex justify-center font-bold text-xl">
            {user?.push_notifications_enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      <div className="w-full mt-auto">
        <button
          onClick={handleLogout}
          className="w-full h-12 bg-red-500 text-white pointer-events-auto"
        >
          Log out!
        </button>
      </div>
    </div>
  )
}
