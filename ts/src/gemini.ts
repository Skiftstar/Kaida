import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'

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
    If you require additional information from the user, you should ask for it in the response.

    Format:
    {
      "key_info": ["List of key points summarizing important information you learn about the user."],
      "response": "A detailed response to the query."
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
    const jsonResponse = JSON.parse(cleanedText)
    console.log(jsonResponse)
  } catch (error) {
    console.error('Error generating text:', error)
  }
}

// generateText("What is the capital of France?");
generateText(
  'I am feeling ill, I have visited a few countries recently and I have a fever. Some of my symptoms include coughing and sneezing. What should I do?'
)
