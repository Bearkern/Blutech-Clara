import axios, { AxiosError } from 'axios';

import type { ApiError } from '../types'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

request.interceptors.response.use(
  res => res,
  (err: AxiosError<ApiError>) => {
    const data = err.response?.data as ApiError | undefined
    return Promise.reject(data ?? { message: err.message })
  }
)

export default request