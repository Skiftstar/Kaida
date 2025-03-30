import * as dotenv from 'dotenv'

dotenv.config()

const API_URL = process.env.API_URL

if (!API_URL) {
  throw new Error('Missing API_URL in .env file')
}

export const storeKeyInfo = async (keyInfo: string[]) => {
  const response = await fetch(`${API_URL}/embeddings/insert-many`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ texts: keyInfo })
  })

  return response.json()
}

export const getRecentDiagnoses = async (amount: number = 5) => {
	const response = await fetch(`${API_URL}/diagnosis/recent-diagnoses?count=${amount}`, {
		method: 'GET'
	})

	return response.json()
}

export const searchEmbeddings = async (searchTerms: string[]) => {
	const response = await fetch(`${API_URL}}/embeddings/search-many?terms=${searchTerms.join("&terms=")}`, {
		method: 'GET'
	})

	return response.json()
}
