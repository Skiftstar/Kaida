import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'
import { storeKeyInfo } from './api'

dotenv.config()

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY in .env file')
}

const genAI = new GoogleGenerativeAI(apiKey)

async function generateText(prompt: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  try {

    const formattedPrompt = NEW_CHAT_PROMPT.replace(
      "{{user_prompt}}",
      prompt
    )

    const result = await model.generateContent(formattedPrompt)
    const responseText = await result.response.text()

    console.log('responesText', responseText)

    // Remove possible markdown formatting (e.g., ```json ... ```)
    const cleanedText = responseText.replace(/```json|```/g, '').trim()

    // Parse the cleaned JSON response
    const jsonResponse: {
      key_permanent_info: string[]
      key_diagnosis_info: string[]
      required_context: string[]
    } = JSON.parse(cleanedText)

    storeKeyInfo(jsonResponse.key_diagnosis_info)

    console.log(jsonResponse)
  } catch (error) {
    console.error('Error generating text:', error)
  }
}

// generateText("What is the capital of France?");
generateText(
  'I am feeling ill, I have visited a few countries recently and I have a fever. Some of my symptoms include coughing and sneezing. What should I do?'
)
