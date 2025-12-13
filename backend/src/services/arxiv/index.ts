import axios from 'axios'
import { config } from '../../config/index.js'
import { logger } from '../../utils/logger.js'
import type { ArxivPaper } from '../../types/index.js'

export class ArxivService {
  private baseUrl: string

  constructor() {
    this.baseUrl = config.arxivBaseUrl
  }

  async fetchPapers(
    category: string,
    maxResults: number = 50,
    daysBack: number = 1
  ): Promise<ArxivPaper[]> {
    try {
      const dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - daysBack)
      const dateStr = dateFrom.toISOString().split('T')[0].replace(/-/g, '')

      const query = `cat:${category} AND submittedDate:[${dateStr}000000 TO ${new Date().toISOString().split('T')[0].replace(/-/g, '')}235959]`

      const url = `${this.baseUrl}?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`

      logger.info(`Fetching papers from arXiv: ${category}`)
      const response = await axios.get(url)

      // TODO: Parse XML response and convert to ArxivPaper[]
      // For now, return empty array
      return []
    } catch (error) {
      logger.error('Error fetching papers from arXiv:', error)
      throw error
    }
  }
}

export const arxivService = new ArxivService()
