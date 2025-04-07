import { ChatSession } from '@google/generative-ai'
import {
  FOLLOW_UP_PROMPT,
  KNOWLEDGE_DATABASE_RESPONSE,
  NEW_CHAT_PROMPT
} from './prompts'
import { userInfo } from 'os'

// Remove possible markdown formatting (e.g., ```json ... ```)
const cleanResponse = (responseText: string): string => {
  const cleanedText = responseText.replace(/```json|```/g, '').trim()
  return cleanedText
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
