import axios from 'axios'
import { logger } from '../../utils/logger.js'

export class NewsAPIService {
  private apiKey: string
  private baseUrl = 'https://newsapi.org/v2'

  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY || ''
    // Remove quotes if present
    this.apiKey = this.apiKey.replace(/^["']|["']$/g, '')

    if (!this.apiKey) {
      logger.warn('NewsAPI key not configured')
    } else {
      logger.info(`NewsAPI key configured (length: ${this.apiKey.length})`)
    }
  }

  async fetchArticles(
    keywords: string[],
    hoursBack: number = 24
  ): Promise<any[]> {
    if (!this.apiKey) {
      logger.warn('NewsAPI key missing - returning empty results')
      return []
    }

    const from = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
    const query = keywords.join(' OR ')

    try {
      logger.info(`Fetching articles from NewsAPI with query: "${query.substring(0, 100)}..."`)
      logger.info(`Time range: from ${from}`)

      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          from,
          language: 'en',
          sortBy: 'relevancy',
          pageSize: 50,
          apiKey: this.apiKey,
        },
      })

      logger.info(`NewsAPI response status: ${response.data.status}`)
      logger.info(`Fetched ${response.data.articles?.length || 0} articles from NewsAPI`)

      if (response.data.articles?.length === 0) {
        logger.warn('NewsAPI returned 0 articles - try broader keywords or longer time range')
      }

      return response.data.articles || []
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.error('NewsAPI authentication failed - check API key')
      } else if (error.response?.status === 429) {
        logger.error('NewsAPI rate limit exceeded')
      } else {
        logger.error('Error fetching from NewsAPI:', error.message)
      }
      return []
    }
  }
}

export const newsAPIService = new NewsAPIService()
