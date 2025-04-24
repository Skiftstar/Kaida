export type User = {
  username: string
  userId: string
  email: string
  push_notifications_enabled: boolean
}

export type Chat = {
  id: number
  title: string
  latest_message: string
  timestamp: number
}

export type ChatInfo = {
  id: number
  title: string
  diagnosis_id: number
}

export type Message = {
  id: string
  message: string
  sender: string
}
