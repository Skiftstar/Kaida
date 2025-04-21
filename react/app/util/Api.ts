import type { User } from "~/types"
import { get, post } from "./Axios"

export const login = async (
  username: string,
  password: string
): Promise<{ username: string; userId: string } | undefined> => {
  const response = await post("/login", {
    username,
    password,
  })

  if (response.status !== 200) {
    return undefined
  }

  const data = await response.data
  return { username: data.username, userId: data.id }
}

export const getCurrentUser = async (): Promise<User | undefined> => {
  const response = await get("/@me")

  console.log(response)

  if (response.status !== 200) {
    return undefined
  }

  const data = await response.data
  return { username: data.username, userId: data.id, email: data.email }
}
