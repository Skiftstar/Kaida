import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'
import {
  createNewDiagnosis,
  getRecentDiagnoses,
  storeKeyDiagnosisInfo,
  storeKeyPermanentInfo
} from './api'
import * as readline from 'readline' // for terminal input

async function parseInitialQuery(
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
    const responseText = await result.response.text()

    console.log('responesText', responseText)

    // Remove possible markdown formatting (e.g., ```json ... ```)
    const cleanedText = responseText.replace(/```json|```/g, '').trim()

    // Parse the cleaned JSON response
    const jsonResponse: {
      key_permanent_info: string[]
      key_diagnosis_info: string[]
      required_context: string[]
      diagnosis_ids: string[]
    } = JSON.parse(cleanedText)
    console.log(jsonResponse)

    // storeKeyInfo(jsonResponse.key_diagnosis_info)

    return jsonResponse
  } catch (error) {
    console.error('Error generating text:', error)
    return undefined
  }
}

function getInput(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function formatNewChatPrompt(input: string): Promise<string> {
  const QUERY_COUNT = 5
  const diagnoses = await getRecentDiagnoses(QUERY_COUNT)

  return NEW_CHAT_PROMPT.replace('{{user_prompt}}', input)
    .replace('{{count}}', QUERY_COUNT.toString())
    .replace('{{diagnoses}}', JSON.stringify(diagnoses))
}

function formatOngoingChatPrompt(input: string): string {
  return FOLLOW_UP_PROMPT.replace('{{user_prompt}}', input)
}

async function main() {
  dotenv.config()
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in .env file')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const chatSession = model.startChat()

  const input = await getInput('How can I help you today?')
  const formattedNewChatPrompt = await formatNewChatPrompt(input)

  const initialQueryInformation = await parseInitialQuery(formattedNewChatPrompt, chatSession)

  if (!initialQueryInformation) {
    console.error('Failed to parse initial query.')
    return
  }

  const diagnosisId = await createNewDiagnosis(
    'Diagnosis Title',
    'Diagnosis Summary'
  )

  // Store the key information in the database
  await storeKeyPermanentInfo(initialQueryInformation.key_permanent_info)
  await storeKeyDiagnosisInfo(
    initialQueryInformation.key_diagnosis_info,
    diagnosisId
  )

  //TODO: Lookup information that Gemini wants and generate response with that

  let userInput = ''

  do {
    userInput = await getInput('User: ')
    const formattedOngoingChatPrompt = formatOngoingChatPrompt(userInput)
    //TODO: handle further chat
  } while (userInput !== 'exit')
}

main()

// generateText(
//   'I am feeling ill, I have visited a few countries recently and I have a fever. Some of my symptoms include coughing and sneezing. What should I do?'
// )
