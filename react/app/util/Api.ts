import type { User } from "~/types"
import { get, post } from "./Axios"

export const login = async (
  username: string,
  password: string,
): Promise<User | undefined> => {
  const response = await post("/login", {
    username,
    password,
  })

  if (response.status !== 200) {
    return undefined
  }

  const data = await response.data
  return buildUser(data)
}

export const getCurrentUser = async (): Promise<User | undefined> => {
  const response = await get("/@me")

  if (response.status !== 200) {
    return undefined
  }

  const data = await response.data
  return buildUser(data)
}

const buildUser = (data: any): User => {
  return {
    username: data.username,
    userId: data.id,
    email: data.email,
    push_notifications_enabled: data.push_notifications_enabled,
  }
}

export const logoutUser = async (): Promise<boolean> => {
  const response = await get("/logout")

  if (response.status !== 200) {
    return false
  }

  return true
}
