import * as dotenv from 'dotenv'

dotenv.config()

const API_URL = process.env.API_URL

if (!API_URL) {
  throw new Error('Missing API_URL in .env file')
}

console.log('API_URL:', API_URL)

export const storeKeyPermanentInfo = async (keyInfo: string[]) => {
  console.log(keyInfo)
  const response = await fetch(`${API_URL}/embeddings/insert-many`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ texts: keyInfo })
  })

  return response.json()
}

export const createNewDiagnosis = async (
  title: string,
  summary: string
): Promise<number> => {
  const response = await fetch(`${API_URL}/diagnosis/insert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, summary })
  })
  const json: any = await response.json()
  const diagnosisId: number = json.id
  return diagnosisId
}

export const storeKeyDiagnosisInfo = async (
  keyInfo: string[],
  diagnosisId: number
) => {
  const response = await fetch(
    `${API_URL}/diagnosis/${diagnosisId}/embeddings/insert-many`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ texts: keyInfo })
    }
  )

  return response.json()
}

export const getRecentDiagnoses = async (amount: number = 5) => {
  const response = await fetch(
    `${API_URL}/diagnosis/recent-diagnoses?count=${amount}`,
    {
      method: 'GET'
    }
  )

  return response.json()
}

export const searchEmbeddings = async (searchTerms: string[]) => {
  const params = new URLSearchParams()
  searchTerms.forEach((term) => {
    params.append('terms', term)
  })
  const response = await fetch(
    `${API_URL}/embeddings/search-many?${params.toString()}`,
    {
      method: 'GET'
    }
  )

  const json = await response.json()
  return json
}
