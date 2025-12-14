import axios from 'axios'
import { logger } from '../../utils/logger.js'

export class StackExchangeService {
  private baseUrl = 'https://api.stackexchange.com/2.3'
  // Best performing tag combinations for AI/ML/DL
  private aiMlTags = [
    'machine-learning', 
    'deep-learning',
    'artificial-intelligence',
    'neural-networks',
    'neural-network',
  ]

  async fetchQuestions(
    _keywords: string[] = [],  // Future use for keyword filtering
    hoursBack: number = 24
  ): Promise<any[]> {
    try {
      // Use optimized tag combination (start with top 3 tags for better results)
      const tags = this.aiMlTags.slice(0, 3)
      const fromDate = Math.floor((Date.now() - hoursBack * 60 * 60 * 1000) / 1000)

      logger.info(`Fetching Stack Overflow questions with tags: ${tags.join(', ')}`)
      logger.info(`Time range: last ${hoursBack} hours (from timestamp ${fromDate})`)

      const response = await axios.get(`${this.baseUrl}/questions`, {
        params: {
          order: 'desc',
          sort: 'activity',  // Most recent activity first
          tagged: tags.join(';'),
          site: 'stackoverflow',
          fromdate: fromDate,
          pagesize: 30,  // Increased to get more results
          filter: 'withbody', // Include question body for filtering
        },
      })

      if (!response.data || !response.data.items) {
        logger.warn(`SO API returned unexpected response`)
        return []
      }

      const questions = response.data.items || []
      logger.info(`Stack Exchange API response: ${questions.length} questions (quota: ${response.data.quota_remaining})`)

      if (questions.length === 0) {
        logger.info(`No recent SO questions found in last ${hoursBack} hours for tags: ${tags.join(', ')}`)
        return []
      }

      return this.enrichQuestions(questions)
    } catch (error: any) {
      logger.error('Error fetching from Stack Exchange API:', error.message)
      if (error.response) {
        logger.error(`SO API error: ${JSON.stringify(error.response.data)}`)
      }
      return []
    }
  }

  private enrichQuestions(questions: any[]): any[] {
    return questions.map((q: any) => ({
      id: q.question_id,
      title: q.title,
      body: this.stripHtml(q.body || ''),
      url: q.link,
      author: q.owner?.display_name || 'Unknown',
      author_reputation: q.owner?.reputation || 0,
      created_at: new Date(q.creation_date * 1000).toISOString(),
      score: q.score,
      view_count: q.view_count || 0,
      answer_count: q.answer_count || 0,
      tags: q.tags || [],
    }))
  }

  private stripHtml(html: string): string {
    // Basic HTML stripping
    return html      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }
}

export const stackExchangeService = new StackExchangeService()