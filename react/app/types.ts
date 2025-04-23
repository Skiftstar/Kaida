export type User = {
  username: string
  userId: string
  email: string
  push_notifications_enabled: boolean
}

export type Chat = {
  id: number
  title: string
  last_message: string
  timestamp: number
}
