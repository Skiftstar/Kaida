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

  const formattedPrompt = `
    You are an AI that responds strictly in valid JSON format. 
    Ensure the JSON does NOT include markdown formatting like triple backticks.
    The point of your existence is to be a medical assistant, giving users information about their health.
    You should be able to answer questions about symptoms, diseases, medications, and general health information.
    To better understand users, you should be extracting key information from the query and summarizing it in the JSON response.
		Differentiate between information that is useful as a permanent info (such as permanent medication, chronic illnesses, eating habits, etc.) and information which is only relevant in the context of the current diagnosis
    Additionally, give keypoints you think further information would be useful for, which will be used to search for more information in our database.
		If you think nothing is important to note down, you can leave the points empty.

    Format:
    {
      "key_permanent_info: [List of key points summarizing important permanent information (such as permanent medication, chronic illnesses, eating habits, etc.) or empty list if no useful data]"
      "key_diagnosis_info": ["List of key points summarizing important information you learn for the current diagnosis only, or empty list if no useful data"],
      "required_context": ["List of key points summarizing important information you think would be useful to search for more information."],
    }

    Query: "${prompt}"
    Respond with only the JSON object.
  `

  try {
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
