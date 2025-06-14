import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Missing VITE_API_URL in .env file')
}

axios.defaults.withCredentials = true
axios.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    if (!error.response) return
    return Promise.reject(error)
  }
)

export const post = (path: string, body: any) => {
  return axios
    .post(API_URL + path, body, { withCredentials: true })
    .catch((err) => {
      return { status: err.response.status, data: null }
    })
}

export const put = (path: string, body: any) => {
  return axios
    .put(API_URL + path, body, { withCredentials: true })
    .catch((err) => {
      return { status: err.response.status, data: null }
    })
}

export const get = (path: string) => {
  return axios
    .get(API_URL + path, {
      withCredentials: true
    })
    .catch((error) => {
      if (error.response) {
        console.error('Error response:', error.response.data)
      } else {
        console.error('Error:', error.message)
      }
      return { status: 500, data: null }
    })
}

export const del = (path: string) => {
  return axios.delete(API_URL + path)
}
