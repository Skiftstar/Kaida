import {
  createNewDiagnosis,
  getRecentDiagnoses,
  searchEmbeddings,
  storeKeyDiagnosisInfo,
  storeKeyPermanentInfo
} from './api'
import * as dotenv from 'dotenv'
import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai'
import { getInput } from './cli/cli_input'
import {
  extractInfoFromUserInput,
  formatNewChatPrompt,
  formatOngoingChatPrompt,
  generateUserResponse,
  parseInitialQuery
} from './gemini'

const handleFirstQuery = async (
  userInput: string,
  chatSession: ChatSession,
  DIAGNOSES_COUNT: number
): Promise<{
  diagnosisId: string
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
      diagnosisId: '',
      initialQueryInformation: {
        key_permanent_info: [],
        key_diagnosis_info: [],
        required_context: [],
        diagnosis_ids: []
      }
    }
  }

  const diagnosisId = await createNewDiagnosis(
    'Diagnosis Title',
    'Diagnosis Summary'
  )

  return {
    diagnosisId,
    initialQueryInformation
  }
}

const storeEmbeddings = async (
  keyPermanentInfo: string[],
  keyDiagnosisInfo: string[],
  diagnosisId: string
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

async function main() {
  dotenv.config()
  const apiKey = process.env.GEMINI_API_KEY
  const DIAGNOSES_COUNT = Number(process.env.RECENT_DIAGNOSES_COUNT)

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in .env file')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const chatSession = model.startChat()
  let userInput = ''

  userInput = await getInput('How can I help you today?')
  const { diagnosisId, initialQueryInformation } = await handleFirstQuery(
    userInput,
    chatSession,
    DIAGNOSES_COUNT
  )

  await storeEmbeddings(
    initialQueryInformation.key_permanent_info,
    initialQueryInformation.key_diagnosis_info,
    diagnosisId
  )

  const { knowledgeData, diagnosesData } = await lookupInformation(
    initialQueryInformation.diagnosis_ids,
    initialQueryInformation.required_context
  )

  const modelResponse = await generateUserResponse(
    knowledgeData,
    diagnosesData,
    userInput,
    chatSession
  )
  const response = modelResponse.response
  console.log('Response:', response)

  do {
    userInput = await getInput('User: ')
    const formattedOngoingChatPrompt = formatOngoingChatPrompt(userInput)
    const ongoingQueryInformation = await extractKeyInfo(
      formattedOngoingChatPrompt,
      chatSession
    )

    storeEmbeddings(
      ongoingQueryInformation.key_permanent_info,
      ongoingQueryInformation.key_diagnosis_info,
      diagnosisId
    )

    const { knowledgeData, diagnosesData } = await lookupInformation(
      ongoingQueryInformation.diagnosis_ids,
      ongoingQueryInformation.required_context
    )

    const modelResponse = await generateUserResponse(
      knowledgeData,
      diagnosesData,
      userInput,
      chatSession
    )
    //TODO: handle further chat
  } while (userInput !== 'exit')
}

main()

//I am feeling ill, I have visited a few countries recently and I have a fever. Some of my symptoms include coughing and sneezing. What should I do?
