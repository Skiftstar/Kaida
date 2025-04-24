import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai'
import {
  FOLLOW_UP_PROMPT,
  KNOWLEDGE_DATABASE_RESPONSE,
  NEW_CHAT_PROMPT
} from './prompts'
import {
  getRecentDiagnoses,
  searchEmbeddings,
  storeKeyDiagnosisInfo,
  storeKeyPermanentInfo
} from '~/util/Api'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const DIAGNOSES_COUNT = import.meta.env.VITE_RECENT_DIAGNOSES_COUNT

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
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const chatSession = model.startChat()
  return chatSession
}

export async function parseInitialQuery(
  prompt: string,
  chatSession: ChatSession
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

    return jsonResponse
  } catch (error) {
    console.error('Error generating text:', error)
    return undefined
  }
}

export async function extractInfoFromUserInput(
  input: string,
  chatSession: ChatSession
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

    return jsonResponse
  } catch (error) {
    console.error('Error generating text:', error)
    return undefined
  }
}

//TODO: change diagnosesData type
export async function generateUserResponse(
  requestedKnowledgeData: { [term: string]: string },
  diagnosesData: any,
  userQuery: string,
  chatSession: ChatSession
) {
  const prompt_template = KNOWLEDGE_DATABASE_RESPONSE.replace(
    '{{diagnoses}}',
    JSON.stringify(diagnosesData)
  )
    .replace('{{knowledge_database}}', JSON.stringify(requestedKnowledgeData))
    .replace('{{user_query}}', userQuery)

  const result = await chatSession.sendMessage(prompt_template)
  const responseText = cleanResponse(result.response.text())

  const jsonResponse: { response: string } = JSON.parse(responseText)
  console.log('jsonResponse', jsonResponse)
  return jsonResponse
}

//TODO: diagnoses type
export async function formatNewChatPrompt(
  input: string,
  query_count: number,
  recentDiagnoses: any[]
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
): Promise<string> => {
  let keyPermanentInfo
  let keyDiagnosisInfo
  let diagnosisIds
  let requiredContext

  if (firstQuery) {
    const { initialQueryInformation } = await handleFirstQuery(
      userInput,
      chatSession
    )
    keyPermanentInfo = initialQueryInformation.key_permanent_info
    keyDiagnosisInfo = initialQueryInformation.key_diagnosis_info
    diagnosisIds = initialQueryInformation.diagnosis_ids
    requiredContext = initialQueryInformation.required_context
  } else {
    const formattedOngoingChatPrompt = formatOngoingChatPrompt(userInput)
    const ongoingQueryInformation = await extractKeyInfo(
      formattedOngoingChatPrompt,
      chatSession
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

  const modelResponse = await generateUserResponse(
    knowledgeData,
    diagnosesData,
    userInput,
    chatSession
  )

  const response = modelResponse.response
  return response
}

const handleFirstQuery = async (
  userInput: string,
  chatSession: ChatSession
): Promise<{
  initialQueryInformation: {
    key_permanent_info: string[]
    key_diagnosis_info: string[]
    required_context: string[]
    diagnosis_ids: string[]
  }
}> => {
  const recentDiagnoses = await getRecentDiagnoses(DIAGNOSES_COUNT)
  const formattedNewChatPrompt = await formatNewChatPrompt(
    userInput,
    DIAGNOSES_COUNT,
    recentDiagnoses
  )

  const initialQueryInformation = await parseInitialQuery(
    formattedNewChatPrompt,
    chatSession
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

const extractKeyInfo = async (userInput: string, chatSession: ChatSession) => {
  const info = await extractInfoFromUserInput(userInput, chatSession)

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
