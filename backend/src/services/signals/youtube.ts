import axios from 'axios'
import { logger } from '../../utils/logger.js'
import { signalFilter, AI_ML_DL_KEYWORDS } from './filter.js'

export class YouTubeService {
  private apiKey: string
  private baseUrl = 'https://www.googleapis.com/youtube/v3'

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || ''
    // Remove quotes if present
    this.apiKey = this.apiKey.replace(/^["']|["']$/g, '')

    if (!this.apiKey) {
      logger.warn('YouTube API key not configured')
    } else {
      logger.info(`YouTube API key configured (length: ${this.apiKey.length})`)
    }
  }

  async fetchVideos(
    query: string = 'machine learning tutorial',
    hoursBack: number = 24,
    keywords: string[] = AI_ML_DL_KEYWORDS,
  ): Promise<any[]> {
    if (!this.apiKey) {
      logger.warn('YouTube API key missing - returning empty results')
      return []
    }

    try {
      logger.info(`Fetching YouTube videos with query: "${query}"`)

      // Calculate publishedAfter date
      const publishedAfter = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          order: 'relevance',
          maxResults: 30,  // Get more results to filter
          publishedAfter,
          key: this.apiKey,
        },
      })

      const items = response.data.items || []
      logger.info(`YouTube API response: ${items.length} videos fetched`)

      // Filter by AI/ML/DL keywords (title + description)
      const filtered = items.filter((item: any) => {
        const text = `${item.snippet.title} ${item.snippet.description}`.toLowerCase()
        return signalFilter.containsAIMLKeywords(text, keywords)
      })

      logger.info(`After AI/ML/DL keyword filtering: ${filtered.length} relevant videos`)

      return this.enrichVideos(filtered)
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.error('YouTube API authentication failed - check API key')
      } else if (error.response?.status === 403) {
        logger.error('YouTube API quota exceeded or access denied')
      } else {
        logger.error('Error fetching from YouTube API:', error.message)
      }
      return []
    }
  }

  private enrichVideos(videos: any[]): any[] {
    return videos.map((video: any) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      thumbnail: video.snippet.thumbnails?.default?.url,
      published_at: video.snippet.publishedAt,
      channel_title: video.snippet.channelTitle,
      channel_id: video.snippet.channelId,
    }))
  }
}

export const youtubeService = new YouTubeService()
