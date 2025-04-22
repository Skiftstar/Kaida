import { usePage } from "~/contexts/PageContext"
import { useUser } from "~/contexts/UserContext"

export default function ProfileRoute() {
  const { user } = useUser()

  const { setCurrPage } = usePage()
  setCurrPage("Profile")

  return (
    <div>
      <span>Profile!</span>
      <span>{user?.username}</span>
      <span>{user?.email}</span>
    </div>
  )
}
