import type {
  Chat,
  ChatInfo,
  Diagnosis,
  Embedding,
  Message,
  MultiDiagnosisEmbeddings,
  Prescription,
  PrescriptionDoseUnit,
  PrescriptionIntervalUnit,
  PromptHistoryMessage,
  Session,
  User
} from '~/types'
import { del, get, post, put } from './Axios'

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

export const getRecentDiagnoses = async (
  amount: number = 5
): Promise<Diagnosis[] | undefined> => {
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

export const deleteDiagnosis = async (
  diagnosisId: number
): Promise<boolean> => {
  const response = await del(`/diagnosis/${diagnosisId}`)

  if (response.status !== 204) return false

  return true
}

export const updateDiagnosis = async (
  diagnosisId: number,
  title: string,
  summary: string,
  title_custom: boolean,
  summary_custom: boolean
) => {
  const response = await put(`/diagnosis/${diagnosisId}`, {
    title,
    summary,
    title_custom,
    summary_custom
  })

  if (response.status !== 200) return false

  return true
}

export const getUserPrescriptions = async (
  ageLimit?: number
): Promise<Prescription[] | undefined> => {
  const response = await get(
    `/meds/get${ageLimit ? `?ageLimit=${ageLimit}` : ''}`
  )

  if (response.status !== 200) return undefined

  return response.data.meds
}

export const createPrescription = async (
  medName: String,
  startDate: string,
  endDate: string,
  dose: number,
  doseUnit: PrescriptionDoseUnit,
  interval: number,
  intervalUnit: PrescriptionIntervalUnit
): Promise<number | undefined> => {
  const response = await post('/meds/insert', {
    medName,
    startDate,
    endDate,
    dose,
    doseUnit,
    interval,
    intervalUnit
  })

  if (response.status !== 201) return undefined

  return response.data.id
}

export const updatePrescription = async (
  id: number,
  medName: String,
  startDate: string,
  endDate: string,
  dose: number,
  doseUnit: PrescriptionDoseUnit,
  interval: number,
  intervalUnit: PrescriptionIntervalUnit
): Promise<boolean> => {
  const response = await put(`/meds/${id}`, {
    medName,
    startDate,
    endDate,
    dose,
    doseUnit,
    interval,
    intervalUnit
  })

  if (response.status !== 200) return false

  return true
}

export const deletePrescription = async (prescId: number) => {
  const response = await del(`/meds/${prescId}`)

  if (response.status !== 204) return false

  return true
}

export const getUserSessions = async (): Promise<Session[] | undefined> => {
  const response = await get('/sessions/get')

  if (response.status !== 200) return undefined

  return response.data.sessions
}

export const createSession = async (
  title: String,
  time: string,
  reason: string,
  diagnosisId: number | undefined
): Promise<number | undefined> => {
  const response = await post('/sessions/insert', {
    title,
    time,
    reason,
    diagnosisId
  })

  if (response.status !== 201) return undefined

  return response.data.id
}

export const updateSession = async (
  id: number,
  title: String,
  time: string,
  reason: string,
  diagnosisId: number | undefined
): Promise<boolean> => {
  const response = await put(`/sessions/${id}`, {
    title,
    time,
    reason,
    diagnosisId
  })

  if (response.status !== 200) return false

  return true
}

export const deleteSession = async (sessionId: number) => {
  const response = await del(`/sessions/${sessionId}`)

  if (response.status !== 204) return false

  return true
}

export const fetchPromptHistory = async (
  chatId: number
): Promise<PromptHistoryMessage[] | undefined> => {
  const response = await get(`/chats/${chatId}/prompt-history/get-history`)

  if (response.status !== 200) return undefined

  return response.data.history
}

export const fetchAllUserEmbeddings = async (): Promise<
  Embedding[] | undefined
> => {
  const response = await get('/embeddings/all')

  if (response.status !== 200) return undefined

  return response.data.embeddings
}

export const deleteUserEmbedding = async (
  embeddingId: number
): Promise<boolean> => {
  const response = await del(`/embeddings/${embeddingId}`)

  if (response.status !== 204) return false

  return true
}

export const updateUserEmbedding = async (
  embeddingId: number,
  text: string
): Promise<boolean> => {
  const response = await put(`/embeddings/${embeddingId}`, { text })

  if (response.status !== 200) return false

  return true
}

export const insertSingleUserEmbedding = async (
  text: string
): Promise<number | undefined> => {
  const response = await post(`/embeddings/insert`, { text })

  if (response.status !== 201) return undefined

  return response.data.id
}

export const getDiagnosisEmbeddings = async (
  diagnosisId: number
): Promise<Embedding[] | undefined> => {
  const response = await get(`/diagnosis/${diagnosisId}/embeddings/all`)

  if (response.status !== 200) return undefined

  return response.data.embeddings
}

export const deleteDiagnosisEmbedding = async (
  embeddingId: number,
  diagnosisId: number
): Promise<boolean> => {
  const response = await del(
    `/diagnosis/${diagnosisId}/embeddings/${embeddingId}`
  )

  if (response.status !== 204) return false

  return true
}

export const updateDiagnosisEmbedding = async (
  embeddingId: number,
  diagnosisId: number,
  text: string
): Promise<boolean> => {
  const response = await put(
    `/diagnosis/${diagnosisId}/embeddings/${embeddingId}`,
    { text }
  )

  if (response.status !== 200) return false

  return true
}

export const insertSingleDiagnosisEmbedding = async (
  text: string,
  diagnosisId: number
): Promise<number | undefined> => {
  const response = await post(`/diagnosis/${diagnosisId}/embeddings/insert`, {
    text
  })

  if (response.status !== 201) return undefined

  return response.data.id
}

export const getMultiDiagnosisEmbeddings = async (
  diagnosisIds: string[]
): Promise<undefined | MultiDiagnosisEmbeddings> => {
  const params = new URLSearchParams()
  diagnosisIds.forEach((id) => {
    params.append('ids', id)
  })
  const response = await get(
    `/diagnosis/get-multi-embedding?${params.toString()}`
  )

  if (response.status !== 200) {
    return undefined
  }

  return response.data
}
