import axios from 'axios'
import { logger } from '../../utils/logger.js'
import { signalFilter, AI_ML_DL_KEYWORDS } from './filter.js'

export class RedditService {
  private baseUrl = 'https://oauth.reddit.com'
  private clientId: string
  private clientSecret: string
  private userAgent = 'research-dashboard/1.0'
  private accessToken: string | null = null
  private tokenExpiration: number = 0

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID || ''
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || ''

    if (!this.clientId || !this.clientSecret) {
      logger.warn('Reddit credentials not configured (REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET)')
    }
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiration) {
      return this.accessToken
    }

    if (!this.clientId || !this.clientSecret) {
      return null
    }

    try {
      logger.debug('Fetching Reddit access token')

      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.userAgent,
          },
          auth: {
            username: this.clientId,
            password: this.clientSecret,
          },
        }
      )

      this.accessToken = response.data.access_token
      this.tokenExpiration = Date.now() + response.data.expires_in * 1000
      return this.accessToken
    } catch (error: any) {
      logger.error('Error fetching Reddit access token:', error.message)
      return null
    }
  }

  async fetchPosts(
    subreddits: string[] = ['MachineLearning', 'learnmachinelearning'],
    _hoursBack: number = 24,  // Future use
    keywords: string[] = AI_ML_DL_KEYWORDS,
  ): Promise<any[]> {
    const token = await this.getAccessToken()
    if (!token) {
      logger.warn('Reddit access token unavailable - returning empty results')
      return []
    }

    const allPosts: any[] = []

    try {
      for (const subreddit of subreddits) {
        logger.info(`Fetching Reddit posts from r/${subreddit}`)

        const response = await axios.get(`${this.baseUrl}/r/${subreddit}/hot`, {
          headers: {
            'User-Agent': this.userAgent,
            'Authorization': `Bearer ${token}`,
          },
          params: {
            limit: 30,
          },
        })

        const posts = response.data.data.children || []
        logger.info(`Reddit r/${subreddit}: Fetched ${posts.length} posts`)

        // Filter by AI/ML/DL keywords
        const filtered = posts
          .map((item: any) => item.data)
          .filter((post: any) => {
            const text = `${post.title} ${post.selftext || ''}`.toLowerCase()
            return signalFilter.containsAIMLKeywords(text, keywords)
          })

        logger.info(`After AI/ML/DL keyword filtering: ${filtered.length} relevant posts`)

        allPosts.push(...this.enrichPosts(filtered))
      }
    } catch (error: any) {
      logger.error('Error fetching from Reddit API:', error.message)
      if (error.response?.data) {
        logger.error(`Reddit API error: ${JSON.stringify(error.response.data)}`)
      }
    }

    return allPosts
  }

  private enrichPosts(posts: any[]): any[] {
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      text: post.selftext,
      url: `https://reddit.com${post.permalink}`,
      author: post.author,
      subreddit: post.subreddit,
      created_at: new Date(post.created_utc * 1000).toISOString(),
      score: post.score,
      num_comments: post.num_comments,
      upvote_ratio: post.upvote_ratio,
    }))
  }
}

export const redditService = new RedditService()
