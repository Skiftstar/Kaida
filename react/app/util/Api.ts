import type { Chat, ChatInfo, Message, User } from '~/types'
import { del, get, post } from './Axios'

export const login = async (
  username: string,
  password: string
): Promise<User | undefined> => {
  const response = await post('/login', {
    username,
    password
  })

  if (response.status !== 200) {
    return undefined
  }

  const data = await response.data
  return buildUser(data)
}

export const getCurrentUser = async (): Promise<User | undefined> => {
  const response = await get('/@me')

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
    push_notifications_enabled: data.push_notifications_enabled
  }
}

export const logoutUser = async (): Promise<boolean> => {
  const response = await get('/logout')

  if (response.status !== 200) {
    return false
  }

  return true
}

export const getAllChatsOfUser = async (): Promise<Chat[]> => {
  const response = await get('/chats/get-user-chats')

  if (response.status !== 200) {
    return []
  }

  return response.data.chats
}

export const createNewDiagnosis = async (
  title: string,
  summary: string
): Promise<number | undefined> => {
  const response = await post('/diagnosis/insert', { title, summary })

  if (response.status !== 201) {
    return undefined
  }

  return response.data.id
}

export const createNewChat = async (
  diagnosisId: number
): Promise<number | undefined> => {
  const response = await post('/chats/insert', {
    diagnosis_id: diagnosisId
  })

  if (response.status !== 201) {
    return undefined
  }

  return response.data.id
}

export const fetchAllChatMessages = async (
  chatId: number
): Promise<Message[] | undefined> => {
  const response = await get(`/chats/${chatId}/get-messages`)

  if (response.status !== 200) {
    return undefined
  }

  return response.data.messages
}

export const getCoreChatInfo = async (
  chatId: number
): Promise<ChatInfo | undefined> => {
  const response = await get(`/chats/${chatId}/core-info`)

  if (response.status !== 200) return undefined

  return response.data
}

export const insertNewChatMessage = async (
  sender: 'User' | 'Bot' | 'System',
  message: string,
  chatId: number
): Promise<number | undefined> => {
  const response = await post(`/chats/${chatId}/insert`, {
    sender,
    message
  })

  if (response.status !== 201) {
    return undefined
  }

  return response.data.id
}

export const getRecentDiagnoses = async (amount: number = 5) => {
  const response = await get(`/diagnosis/recent-diagnoses?count=${amount}`)

  if (response.status !== 200) return undefined

  return response.data
}

export const searchEmbeddings = async (searchTerms: string[]) => {
  const params = new URLSearchParams()
  searchTerms.forEach((term) => {
    params.append('terms', term)
  })
  const response = await get(`/embeddings/search-many?${params.toString()}`)

  if (response.status !== 200) return undefined

  return response.data
}

export const storeKeyPermanentInfo = async (keyInfo: string[]) => {
  console.log(keyInfo)
  const response = await post(`/embeddings/insert-many`, {
    texts: keyInfo
  })

  if (response.status !== 201) return undefined

  return response.data
}

export const storeKeyDiagnosisInfo = async (
  keyInfo: string[],
  diagnosisId: number
) => {
  const response = await post(
    `/diagnosis/${diagnosisId}/embeddings/insert-many`,
    {
      texts: keyInfo
    }
  )

  if (response.status !== 201) return undefined

  return response.data
}

export const addToPromptHistory = async (
  chatId: number,
  sender: string,
  prompt: string
): Promise<number | undefined> => {
  const response = await post(`/chats/${chatId}/prompt-history/insert`, {
    sender,
    prompt
  })

  if (response.status !== 201) return undefined

  return response.data.id
}

export const deleteChat = async (chatId: string) => {
  const response = await del(`/chats/${chatId}`)

  if (response.status !== 204) return false

  return true
}

export const deleteDiagnosis = async (diagnosisId: string) => {
  const response = await del(`/diagnosis/${diagnosisId}`)

  if (response.status !== 204) return false

  return true
}
