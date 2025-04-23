import type { Chat, User } from "~/types"
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

export const getAllChatsOfUser = async (): Promise<Chat[]> => {
  const response = await get("/chats/get-user-chats")

  if (response.status !== 200) {
    return []
  }

  return response.data.chats
}

export const createNewDiagnosis = async (
  title: string,
  summary: string,
): Promise<number | undefined> => {
  const response = await post("/diagnosis/insert", { title, summary })

  if (response.status !== 201) {
    return undefined
  }

  return response.data.id
}

export const createNewChat = async (
  diagnosisId: number,
): Promise<number | undefined> => {
  const response = await post("/chats/insert", {
    diagnosis_id: diagnosisId,
  })

  if (response.status !== 201) {
    return undefined
  }

  return response.data.id
}
