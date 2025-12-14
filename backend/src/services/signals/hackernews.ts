import axios from 'axios'
import { logger } from '../../utils/logger.js'
import { signalFilter, AI_ML_DL_KEYWORDS } from './filter.js'

export class HackerNewsService {
  private searchUrl = 'https://hn.algolia.com/api/v1'

  async fetchStories(
    keywords: string[] = AI_ML_DL_KEYWORDS,
    hoursBack: number = 24
  ): Promise<any[]> {
    try {
      // Fetch recent stories from HN directly; DEV mode keeps everything
      logger.info(`Fetching HN stories (DEV: no keyword filtering)`)  // DEV message
      logger.info(`Time range: last ${hoursBack} hours`)

      const timestampSeconds = Math.floor((Date.now() - hoursBack * 60 * 60 * 1000) / 1000)

      // Get all recent stories from HN
      const response = await axios.get(`${this.searchUrl}/search`, {
        params: {
          query: '',  // Empty query to get recent stories
          tags: 'story',
          numericFilters: `created_at_i>${timestampSeconds}`,
          hitsPerPage: 50,  // Get more to filter down
        },
      })

      if (!response.data || !response.data.hits) {
        logger.warn(`HN API returned unexpected response structure`)
        return []
      }

      const stories = response.data.hits || []
      logger.info(`HN API response: ${stories.length} recent stories fetched`)

      // DEV: return everything, let downstream decide
      return this.enrichStories(stories)
    } catch (error: any) {
      logger.error('Error fetching from Hacker News API:', error.message)
      if (error.response) {
        logger.error(`HN API error response: ${JSON.stringify(error.response.data)}`)
      }
      return []
    }
  }

  private enrichStories(stories: any[]): any[] {
    return stories.map((story: any) => ({
      id: story.objectID,
      title: story.title,
      url: story.url || `https://news.ycombinator.com/item?id=${story.objectID}`,
      author: story.author,
      created_at: new Date(story.created_at_i * 1000).toISOString(),
      points: story.points || 0,
      num_comments: story.num_comments || 0,
      story_text: story.story_text || story.comment_text || '',
    }))
  }
}

export const hackerNewsService = new HackerNewsService()
