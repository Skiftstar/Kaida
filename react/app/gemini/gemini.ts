import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai'
import {
  CONTEXT_FILL_PROMPT,
  FOLLOW_UP_PROMPT,
  KNOWLEDGE_DATABASE_RESPONSE,
  NEW_CHAT_PROMPT
} from './prompts'
import {
  addToPromptHistory,
  fetchPromptHistory,
  getMultiDiagnosisEmbeddings,
  getRecentDiagnoses,
  getUserPrescriptions,
  insertNewChatMessage,
  searchEmbeddings,
  storeKeyDiagnosisInfo,
  storeKeyPermanentInfo
} from '~/util/Api'
import type {
  Action,
  Diagnosis,
  MultiDiagnosisEmbeddings,
  Prescription
} from '~/types'
import { handleActions } from './actions'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const DIAGNOSES_COUNT = import.meta.env.VITE_RECENT_DIAGNOSES_COUNT
const MEDICAL_PLAN_LIMIT = import.meta.env.VITE_MEDICAL_PLAN_LIMIT // How old (in days) medical plans can be to still be considered relevant
const CONTEXT_REFRESH_CHUNK_SIZE = import.meta.env
  .VITE_CONTEXT_REFRESH_CHUNK_SIZE // How many messages will be sent at once per context refesh message

if (!GEMINI_API_KEY) {
  throw new Error('Missing VITE_GEMINI_API_KEY in .env file')
}

// Remove possible markdown formatting (e.g., ```json ... ```)
const cleanResponse = (responseText: string): string => {
  const cleanedText = responseText.replace(/```json|```/g, '').trim()
  return cleanedText
}

export const createChatSession = (): ChatSession => {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite'
  })
  const chatSession = model.startChat()
  return chatSession
}

export async function parseInitialQuery(
  prompt: string,
  chatSession: ChatSession,
  chatId: number
): Promise<
  | {
      key_permanent_info: string[]
      key_diagnosis_info: string[]
      required_context: string[]
      diagnosis_ids: string[]
    }
  | undefined
> {
  try {
    const result = await sendToGemini(prompt, chatSession, chatId)
    const responseText = cleanResponse(result)

    console.log('responesText', responseText)

    // Parse the cleaned JSON response
    const jsonResponse: {
      key_permanent_info: string[]
      key_diagnosis_info: string[]
      required_context: string[]
      diagnosis_ids: string[]
    } = JSON.parse(responseText)

    await addToPromptHistory(chatId, 'System', prompt)
    await addToPromptHistory(chatId, 'Bot', responseText)

    return jsonResponse
  } catch (error) {
    console.error('Error generating text:', error)
    return undefined
  }
}

export async function extractInfoFromUserInput(
  input: string,
  chatSession: ChatSession,
  chatId: number
): Promise<
  | {
      key_permanent_info: string[]
      key_diagnosis_info: string[]
      required_context: string[]
      diagnosis_ids: string[]
    }
  | undefined
> {
  try {
    const result = await sendToGemini(input, chatSession, chatId)
    console.log(result)
    const responseText = cleanResponse(result)

    // Parse the cleaned JSON response
    const jsonResponse: {
      key_permanent_info: string[]
      key_diagnosis_info: string[]
      required_context: string[]
      diagnosis_ids: string[]
    } = JSON.parse(responseText)
    console.log('keyInfoExtraction', responseText)

    await addToPromptHistory(chatId, 'System', input)
    await addToPromptHistory(chatId, 'Bot', responseText)

    return jsonResponse
  } catch (error: any) {
    await insertNewChatMessage(
      'System',
      `Kaida ran into an error generating the response.\nIf this error persists please contact support.\nError: ${error.message}`,
      chatId
    )
    return undefined
  }
}

export async function generateUserResponse(
  requestedKnowledgeData: { [term: string]: string },
  medicalPlans: Prescription[],
  diagnosesData: MultiDiagnosisEmbeddings,
  userQuery: string,
  chatSession: ChatSession,
  chatId: number
) {
  const prompt_template = KNOWLEDGE_DATABASE_RESPONSE.replace(
    '{{diagnoses}}',
    JSON.stringify(diagnosesData)
  )
    .replace('{{knowledge_database}}', JSON.stringify(requestedKnowledgeData))
    .replace('{{user_query}}', userQuery)
    .replace('{{current_date}}', new Date(Date.now()).toLocaleDateString())
    .replace('{{medical_plans}}', JSON.stringify(medicalPlans))

  const result = await sendToGemini(prompt_template, chatSession, chatId)
  const responseText = cleanResponse(result)

  try {
    const jsonResponse: {
      response: string
      actions: Action[]
    } = JSON.parse(responseText)

    await addToPromptHistory(chatId, 'System', prompt_template)
    await addToPromptHistory(chatId, 'Bot', responseText)

    return jsonResponse
  } catch (error: any) {
    await insertNewChatMessage(
      'System',
      `Kaida ran into an error generating the response.\nIf this error persists please contact support.\nError: ${error.message}`,
      chatId
    )
    return { response: '', actions: [] }
  }
}

export async function formatNewChatPrompt(
  input: string,
  query_count: number,
  recentDiagnoses: Diagnosis[]
): Promise<string> {
  return NEW_CHAT_PROMPT.replace('{{user_prompt}}', input)
    .replace('{{count}}', query_count.toString())
    .replace('{{diagnoses}}', JSON.stringify(recentDiagnoses))
}

export function formatOngoingChatPrompt(input: string): string {
  return FOLLOW_UP_PROMPT.replace('{{user_prompt}}', input)
}

export const handleUserInput = async (
  chatSession: ChatSession,
  chatId: number,
  userInput: string,
  diagnosisId: number,
  firstQuery: boolean = false
): Promise<{ response: string; actionsExecuted: boolean }> => {
  let keyPermanentInfo
  let keyDiagnosisInfo
  let diagnosisIds
  let requiredContext

  if (firstQuery) {
    const { initialQueryInformation } = await handleFirstQuery(
      userInput,
      chatSession,
      chatId
    )
    keyPermanentInfo = initialQueryInformation.key_permanent_info
    keyDiagnosisInfo = initialQueryInformation.key_diagnosis_info
    diagnosisIds = initialQueryInformation.diagnosis_ids
    requiredContext = initialQueryInformation.required_context
  } else {
    const formattedOngoingChatPrompt = formatOngoingChatPrompt(userInput)
    const ongoingQueryInformation = await extractKeyInfo(
      formattedOngoingChatPrompt,
      chatSession,
      chatId
    )

    keyDiagnosisInfo = ongoingQueryInformation.key_diagnosis_info
    keyPermanentInfo = ongoingQueryInformation.key_permanent_info
    diagnosisIds = ongoingQueryInformation.diagnosis_ids
    requiredContext = ongoingQueryInformation.required_context
  }

  await storeEmbeddings(keyPermanentInfo, keyDiagnosisInfo, diagnosisId)

  const { knowledgeData, diagnosesData } = await lookupInformation(
    diagnosisIds,
    requiredContext
  )

  const medicalPlans = (await getUserPrescriptions(MEDICAL_PLAN_LIMIT)) ?? []

  const modelResponse = await generateUserResponse(
    knowledgeData,
    medicalPlans,
    diagnosesData,
    userInput,
    chatSession,
    chatId
  )

  const response = modelResponse.response
  await handleActions(modelResponse.actions, diagnosisId, chatId)
  return { response, actionsExecuted: modelResponse.actions.length > 0 }
}

const handleFirstQuery = async (
  userInput: string,
  chatSession: ChatSession,
  chatId: number
): Promise<{
  initialQueryInformation: {
    key_permanent_info: string[]
    key_diagnosis_info: string[]
    required_context: string[]
    diagnosis_ids: string[]
  }
}> => {
  const recentDiagnoses = (await getRecentDiagnoses(DIAGNOSES_COUNT)) ?? []
  const formattedNewChatPrompt = await formatNewChatPrompt(
    userInput,
    DIAGNOSES_COUNT,
    recentDiagnoses
  )

  const initialQueryInformation = await parseInitialQuery(
    formattedNewChatPrompt,
    chatSession,
    chatId
  )

  if (!initialQueryInformation) {
    console.error('Failed to parse initial query.')
    return {
      initialQueryInformation: {
        key_permanent_info: [],
        key_diagnosis_info: [],
        required_context: [],
        diagnosis_ids: []
      }
    }
  }

  return {
    initialQueryInformation
  }
}

const storeEmbeddings = async (
  keyPermanentInfo: string[],
  keyDiagnosisInfo: string[],
  diagnosisId: number
) => {
  if (keyPermanentInfo.length > 0) {
    console.log('Storing key permanent info:', keyPermanentInfo)
    await storeKeyPermanentInfo(keyPermanentInfo)
  }
  if (keyDiagnosisInfo.length > 0) {
    console.log('Storing key diagnosis info:', keyDiagnosisInfo)
    await storeKeyDiagnosisInfo(keyDiagnosisInfo, diagnosisId)
  }
}

const lookupInformation = async (
  diagnosisIds: string[],
  lookupTerms: string[]
) => {
  const knowledgeData =
    lookupTerms.length > 0 ? await searchEmbeddings(lookupTerms) : {}
  const diagnosesData: MultiDiagnosisEmbeddings =
    (await getMultiDiagnosisEmbeddings(diagnosisIds)) ?? {}

  return { knowledgeData, diagnosesData }
}

const extractKeyInfo = async (
  userInput: string,
  chatSession: ChatSession,
  chatId: number
) => {
  const info = await extractInfoFromUserInput(userInput, chatSession, chatId)

  if (!info) {
    console.error('Failed to extract key information.')
    return {
      key_permanent_info: [],
      key_diagnosis_info: [],
      required_context: [],
      diagnosis_ids: []
    }
  }

  return info
}

export const handleChatContinuation = async (
  chatSession: ChatSession,
  chatId: number
) => {
  const prompts = await fetchPromptHistory(chatId)

  if (!prompts) {
    await insertNewChatMessage(
      'System',
      'Kaida ran into an error trying to initiate the Chat. If this error persists please contact support.',
      chatId
    )
    return
  }

  let response = await sendToGemini(CONTEXT_FILL_PROMPT, chatSession, chatId)
  let responseText = cleanResponse(response)
  if (responseText !== 'Acknowledged') {
    await insertNewChatMessage(
      'System',
      'Kaida ran into an error trying to initiate the Chat. If this error persists please contact support.',
      chatId
    )
    return
  }

  for (let i = 0; i < prompts.length; i += CONTEXT_REFRESH_CHUNK_SIZE) {
    const chunk = prompts.slice(i, i + CONTEXT_REFRESH_CHUNK_SIZE)
    const isLast = i + 4 >= prompts.length

    const formattedPrompts = chunk.map((prompt) => {
      return {
        sender: prompt.sender,
        prompt: prompt.prompt
      }
    })
    const input = `${JSON.stringify(formattedPrompts)} ${
      isLast
        ? 'DONE :D Now stop responding with "Acknowledged" and follow new instructions.'
        : ''
    }`

    response = await sendToGemini(input, chatSession, chatId)
    responseText = cleanResponse(response)
    if (responseText !== 'Acknowledged') {
      await insertNewChatMessage(
        'System',
        'Kaida ran into an error trying to initiate the Chat. If this error persists please contact support.',
        chatId
      )
      return
    }
  }
}

const sendToGemini = async (
  message: string,
  chatSession: ChatSession,
  chatId: number
) => {
  try {
    const response = await chatSession.sendMessage(message)
    console.log(message, response.response.text())
    return response.response.text()
  } catch (err: any) {
    await insertNewChatMessage(
      'System',
      `Kaida ran into an error generating the response.\nIf this error persists please contact support.\nError: ${err.message}`,
      chatId
    )
    return ''
  }
}
