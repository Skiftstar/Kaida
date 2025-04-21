import { useUser } from "~/contexts/UserContext"

export default function ProfileRoute() {
  const { user } = useUser()

  return (
    <div>
      <span>Profile!</span>
      <span>{user?.username}</span>
    </div>
  )
}
