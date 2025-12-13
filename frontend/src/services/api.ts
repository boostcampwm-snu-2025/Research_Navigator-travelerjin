import axios from 'axios'
import type { Paper, FilterOptions } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const paperApi = {
  getTodaysPapers: async (filters?: FilterOptions): Promise<Paper[]> => {
    const response = await apiClient.get('/papers/today', { params: filters })
    return response.data
  },

  getPaperById: async (id: string): Promise<Paper> => {
    const response = await apiClient.get(`/papers/${id}`)
    return response.data
  },

  searchPapers: async (query: string): Promise<Paper[]> => {
    const response = await apiClient.get('/papers/search', { params: { q: query } })
    return response.data
  },
}

export default apiClient
