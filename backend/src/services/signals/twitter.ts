import axios from 'axios'
import { logger } from '../../utils/logger.js'

export class TwitterService {
  private bearerToken: string
  private baseUrl = 'https://api.twitter.com/2'

  constructor() {
    this.bearerToken = process.env.X_BEARER_TOKEN || ''
    // Remove quotes if present
    this.bearerToken = this.bearerToken.replace(/^["']|["']$/g, '')

    if (!this.bearerToken) {
      logger.warn('Twitter bearer token not configured')
    } else {
      logger.info(`Twitter API configured (token length: ${this.bearerToken.length})`)
    }
  }

  async fetchTweets(
    keywords: string[],
    hoursBack: number = 24
  ): Promise<any[]> {
    if (!this.bearerToken) {
      logger.warn('Twitter bearer token missing - returning empty results')
      return []
    }

    // Build query for Twitter API v2
    // Format: (keyword1 OR keyword2) -is:retweet lang:en
    const query = `(${keywords.map(k => `"${k}"`).join(' OR ')}) -is:retweet lang:en`

    // Calculate start_time (Twitter requires ISO 8601 format)
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

    try {
      logger.info(`Fetching tweets with query: "${query.substring(0, 100)}..."`)
      logger.info(`Time range: from ${startTime}`)

      const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
        },
        params: {
          query,
          start_time: startTime,
          max_results: 50,
          'tweet.fields': 'created_at,public_metrics,author_id,entities',
          'user.fields': 'username,name,public_metrics,verified',
          'expansions': 'author_id',
        },
      })

      const tweets = response.data.data || []
      const users = response.data.includes?.users || []

      logger.info(`Twitter API response: ${tweets.length} tweets fetched`)

      // Map tweets to include user info
      const enrichedTweets = tweets.map((tweet: any) => {
        const user = users.find((u: any) => u.id === tweet.author_id)
        return {
          ...tweet,
          author: user,
        }
      })

      return enrichedTweets
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.error('Twitter API authentication failed - check bearer token')
      } else if (error.response?.status === 429) {
        logger.error('Twitter API rate limit exceeded')
      } else if (error.response?.data) {
        logger.error('Twitter API error:', error.response.data)
      } else {
        logger.error('Error fetching from Twitter API:', error.message)
      }
      return []
    }
  }
}

export const twitterService = new TwitterService()
