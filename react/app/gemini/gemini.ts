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
  getRecentDiagnoses,
  getUserPrescriptions,
  searchEmbeddings,
  storeKeyDiagnosisInfo,
  storeKeyPermanentInfo
} from '~/util/Api'
import type { Action, Diagnosis, Prescription } from '~/types'
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
    const result = await chatSession.sendMessage(prompt)
    const responseText = cleanResponse(result.response.text())

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
    const result = await chatSession.sendMessage(input)
    const responseText = cleanResponse(result.response.text())

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
  } catch (error) {
    console.error('Error generating text:', error)
    return undefined
  }
}

//TODO: change diagnosesData type
export async function generateUserResponse(
  requestedKnowledgeData: { [term: string]: string },
  medicalPlans: Prescription[],
  diagnosesData: any,
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

  const result = await chatSession.sendMessage(prompt_template)
  const responseText = cleanResponse(result.response.text())

  const jsonResponse: {
    response: string
    actions: Action[]
  } = JSON.parse(responseText)
  console.log('jsonResponse', jsonResponse)

  await addToPromptHistory(chatId, 'System', prompt_template)
  await addToPromptHistory(chatId, 'Bot', responseText)

  return jsonResponse
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
  //TODO: Lookup information that Gemini wants and generate response with that
  const knowledgeData =
    lookupTerms.length > 0 ? await searchEmbeddings(lookupTerms) : {}
  const diagnosesData: any[] = []

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
    return //TODO: Error handling
  }

  let response = await chatSession.sendMessage(CONTEXT_FILL_PROMPT)
  let responseText = cleanResponse(response.response.text())
  if (responseText !== 'Acknowledged') return //TODO: Error handling

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
      isLast ? 'DONE :D' : ''
    }`

    response = await chatSession.sendMessage(input)
    responseText = cleanResponse(response.response.text())
    if (responseText !== 'Acknowledged') return //TODO: Error handling
  }
}
